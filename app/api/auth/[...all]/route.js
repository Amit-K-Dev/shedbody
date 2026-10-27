/**
 * app/api/auth/[...all]/route.js
 *
 * Next.js App Router Route Handler for Better Auth.
 *
 * Security Invariants & Hardening:
 * 1. Fixed, Trusted Worker Origin: Only permits valid HTTPS URLs matching trusted Worker domains
 *    from server-only configuration (`AUTH_WORKER_URL` or `BETTER_AUTH_URL`). Rejects arbitrary upstreams.
 * 2. Origin & Host Validation: Validates incoming `Origin` headers against trusted frontend origins
 *    (`shedbody.com`, `*.vercel.app`, `localhost`). Rejects untrusted cross-origin requests with 403 Forbidden.
 * 3. SSRF & Path Traversal Prevention: Rejects protocol-relative paths (`//`) or directory traversal.
 *    Strictly bounds forwarded paths to `/api/auth/*`.
 * 4. Open Redirect Prevention: Rewrites upstream redirects strictly to the trusted frontend origin.
 *    Rejects or cleanses redirects pointing to untrusted external third parties.
 * 5. Cookie Sanitization: Strips upstream `Domain=...` attributes from `Set-Cookie` headers so
 *    cookies remain host-only on the frontend domain, preventing Public Suffix List (PSL) rejection.
 * 6. Hop-by-Hop Header Stripping: Removes connection/hop-by-hop headers per RFC 7230 / RFC 9110.
 * 7. Fail-Closed: Returns HTTP 503 if no auth backend is configured, or HTTP 502 on gateway failure.
 */

import { NextResponse } from 'next/server.js';
import { handleEdgeAuthRequest } from '../../../../lib/auth/edgeAuthHandler.js';
import { isD1Binding, getRuntimeD1Binding } from '../../../../lib/auth/betterAuthEngine.js';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const PINNED_UPSTREAM_WORKER_HOSTS = new Set([
  'shedbody-auth-worker.amitforge.workers.dev',
  'shedbody-auth-worker-staging.amitforge.workers.dev',
  'auth.shedbody.com',
  // Note: 'shedbody.com' is explicitly excluded because it is the Next.js frontend origin.
  // Allowing it would create an accidental recursive self-proxy loop.
]);

/**
 * Validates whether a Worker base URL is well-formed, uses secure protocol, and belongs to an exact pinned domain.
 * Prohibits blanket trust in *.workers.dev and prevents self-proxy loops.
 */
export function isTrustedWorkerUrl(rawUrl, options = {}) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl);
    // Reject embedded credentials
    if (parsed.username || parsed.password) return false;

    const hostname = parsed.hostname.toLowerCase();

    // Prevent accidental self-loops: upstream worker host must NEVER be the Next.js frontend host
    if (hostname === 'shedbody.com' || hostname === 'www.shedbody.com') {
      return false;
    }

    // Localhost development: only permitted if NODE_ENV !== 'production' or options.allowLocal === true
    const isLocalAllowed =
      options.allowLocal !== undefined
        ? options.allowLocal
        : (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (!isLocalAllowed) return false;
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }

    // Remote targets must be HTTPS on default port
    if (parsed.protocol !== 'https:') return false;
    if (parsed.port && parsed.port !== '443') return false;

    // PINNED: Must match exactly one of the pinned upstream hosts
    return PINNED_UPSTREAM_WORKER_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

/**
 * Validates whether an incoming Origin header belongs to an authorized frontend domain.
 * Enforces separate policies for staging, production, and development environments.
 * Staging does NOT trust production domains by default.
 */
export function isTrustedFrontendOrigin(originStr, env = (typeof process !== 'undefined' ? process.env : {})) {
  if (!originStr || typeof originStr !== 'string') return false;
  const trimmed = originStr.trim();
  if (!trimmed || trimmed === 'null') return false;

  try {
    const parsed = new URL(trimmed);

    // Reject embedded credentials
    if (parsed.username || parsed.password) return false;

    const hostname = parsed.hostname.toLowerCase();

    // Staging Environment Resolution (Milestone 5D.3D.14D):
    // Do not assume APP_ENV=staging is automatically set by Vercel.
    // Recognize explicit deployment variables, Vercel preview environments, branch refs, and configured URLs.
    const isStagingEnv =
      env?.APP_ENV?.toLowerCase() === 'staging' ||
      env?.NEXT_PUBLIC_APP_ENV?.toLowerCase() === 'staging' ||
      env?.ENVIRONMENT?.toLowerCase() === 'staging' ||
      env?.VERCEL_ENV === 'preview' ||
      env?.VERCEL_GIT_COMMIT_REF === 'staging' ||
      (typeof env?.NEXT_PUBLIC_APP_URL === 'string' && env.NEXT_PUBLIC_APP_URL.includes('staging')) ||
      (typeof env?.AUTH_WORKER_URL === 'string' && env.AUTH_WORKER_URL.includes('staging'));

    const isProductionEnv =
      !isStagingEnv &&
      (env?.APP_ENV?.toLowerCase() === 'production' ||
       env?.VERCEL_ENV === 'production' ||
       env?.NODE_ENV === 'production');

    // Localhost development: only permitted when NOT in production environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (isProductionEnv) return false;
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }

    // Remote targets must be HTTPS on default port
    if (parsed.protocol !== 'https:') return false;
    if (parsed.port && parsed.port !== '443') return false;

    // Staging Origin Policy:
    // Staging Worker / proxy MUST NOT trust production domains by default.
    // Staging trusts: staging domain, exact NEXT_PUBLIC_APP_URL, exact VERCEL_URL, and explicit ALLOWED_ORIGINS.
    if (isStagingEnv) {
      if (hostname === 'staging.shedbody.com') {
        return true;
      }

      if (env?.NEXT_PUBLIC_APP_URL) {
        try {
          const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
          if (parsed.origin === appUrl.origin) return true;
        } catch {}
      }

      if (env?.VERCEL_URL) {
        try {
          const vercelOrigin = new URL(`https://${env.VERCEL_URL}`).origin;
          if (parsed.origin === vercelOrigin) return true;
        } catch {}
      }

      if (env?.ALLOWED_ORIGINS) {
        const allowedList = String(env.ALLOWED_ORIGINS)
          .split(',')
          .map((o) => o.trim().toLowerCase())
          .filter(Boolean);
        if (allowedList.includes(parsed.origin.toLowerCase())) {
          return true;
        }
      }

      // Production origins (shedbody.com, www.shedbody.com) are REJECTED in staging unless explicitly in ALLOWED_ORIGINS
      return false;
    }

    // Production Origin Policy:
    // Production trusts only production domains and explicit production config.
    if (isProductionEnv) {
      if (hostname === 'shedbody.com' || hostname === 'www.shedbody.com') {
        return true;
      }

      if (env?.NEXT_PUBLIC_APP_URL) {
        try {
          const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
          if (parsed.origin === appUrl.origin) return true;
        } catch {}
      }

      if (env?.ALLOWED_ORIGINS) {
        const allowedList = String(env.ALLOWED_ORIGINS)
          .split(',')
          .map((o) => o.trim().toLowerCase())
          .filter(Boolean);
        if (allowedList.includes(parsed.origin.toLowerCase())) {
          return true;
        }
      }

      // Staging and preview deployments are strictly REJECTED in production
      return false;
    }

    // Development / Other environment
    if (env?.NEXT_PUBLIC_APP_URL) {
      try {
        const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
        if (parsed.origin === appUrl.origin) return true;
      } catch {}
    }
    if (env?.ALLOWED_ORIGINS) {
      const allowedList = String(env.ALLOWED_ORIGINS)
        .split(',')
        .map((o) => o.trim().toLowerCase())
        .filter(Boolean);
      if (allowedList.includes(parsed.origin.toLowerCase())) {
        return true;
      }
    }
    if (hostname === 'shedbody.com' || hostname === 'www.shedbody.com') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Strips upstream Domain attribute from Set-Cookie string to ensure host-only scoping.
 * Preserves all other attributes (HttpOnly, Secure, SameSite, Path, Expires, Max-Age).
 */
export function sanitizeSetCookieHeader(setCookieStr) {
  if (!setCookieStr || typeof setCookieStr !== 'string') return '';
  const trimmed = setCookieStr.trim();
  if (!trimmed) return '';

  // Validate presence of cookie name=value pair
  const firstSemicolon = trimmed.indexOf(';');
  const nameValuePart = firstSemicolon === -1 ? trimmed : trimmed.slice(0, firstSemicolon);
  if (!nameValuePart.includes('=')) return '';

  // Remove Domain=... attribute (case-insensitive) while preserving other attributes
  return trimmed.replace(/;\s*domain=[^;]+/gi, '');
}

/**
 * Safely splits a comma-joined Set-Cookie header string into individual cookie strings.
 * Accurately distinguishes between comma separators between cookies and commas within Expires date strings.
 *
 * @param {string} headerStr
 * @returns {string[]} Array of individual Set-Cookie strings
 */
export function splitSetCookieString(headerStr) {
  if (typeof headerStr !== 'string') return [];
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;

  function skipWhitespace() {
    while (pos < headerStr.length && /\s/.test(headerStr.charAt(pos))) {
      pos += 1;
    }
    return pos < headerStr.length;
  }

  function notSpecialChar() {
    ch = headerStr.charAt(pos);
    return ch !== '=' && ch !== ';' && ch !== ',';
  }

  while (pos < headerStr.length) {
    start = pos;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      ch = headerStr.charAt(pos);
      if (ch === ',') {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;

        while (pos < headerStr.length && notSpecialChar()) {
          pos += 1;
        }

        // If an '=' is found after the comma, and it is preceded by cookie-name characters, it's a new cookie
        if (pos < headerStr.length && headerStr.charAt(pos) === '=') {
          cookiesSeparatorFound = true;
          cookiesStrings.push(headerStr.substring(start, lastComma));
          pos = nextStart;
          break;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound) {
      cookiesStrings.push(headerStr.substring(start));
      break;
    }
  }

  return cookiesStrings;
}

/**
 * Extracts individual Set-Cookie strings from a Fetch Response object across diverse Node/Vercel runtimes.
 *
 * Runtime Support:
 * 1. WHATWG Headers.prototype.getSetCookie(): Supported natively in Node.js >= 18.14.1, Node.js 20+, and modern Vercel runtimes.
 * 2. Node-fetch headers.raw(): Supported in node-fetch / older undici environments where raw() returns string[].
 * 3. Fallback: Uses splitSetCookieString to parse single comma-joined header without corrupting Expires dates.
 *
 * @param {Response} response
 * @returns {string[]}
 */
export function extractSetCookieHeaders(response) {
  if (!response || !response.headers) return [];

  // Primary: Native Headers.getSetCookie()
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie();
  }

  // Secondary: Node-fetch raw headers
  if (typeof response.headers.raw === 'function') {
    const rawHeaders = response.headers.raw();
    if (rawHeaders && Array.isArray(rawHeaders['set-cookie'])) {
      return rawHeaders['set-cookie'];
    }
  }

  // Fallback: Safe comma split for joined headers
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && typeof setCookie === 'string') {
    return splitSetCookieString(setCookie);
  }

  return [];
}

async function handleAuth(request) {
  let cfEnv = {};
  try {
    const cf = await import('@opennextjs/cloudflare');
    cfEnv = cf?.getCloudflareContext?.()?.env || {};
  } catch {}

  const env = { ...process.env, ...cfEnv };
  if (!env.DB) {
    const runtimeD1 = getRuntimeD1Binding();
    if (runtimeD1) env.DB = runtimeD1;
  }

  // Strict Server Gate (Milestones 5D.3D.14D & 5D.3D.14E):
  // ENABLE_BETTER_AUTH === "true" is the ONLY server-side condition that enables Better Auth
  // across ALL runtime modes (both Direct D1 Binding Mode A and Reverse Proxy Mode B).
  // Under NO circumstances does NEXT_PUBLIC_ENABLE_BETTER_AUTH, query parameters,
  // or the presence of a D1 binding enable this route when ENABLE_BETTER_AUTH !== "true".
  const isServerGateEnabled = env.ENABLE_BETTER_AUTH === 'true';

  if (!isServerGateEnabled) {
    return NextResponse.json(
      {
        error: 'AUTH_BACKEND_DISABLED',
        message: 'Better Auth is disabled by server configuration (ENABLE_BETTER_AUTH !== "true")',
      },
      { status: 503 }
    );
  }

  // Mode B: Reverse Proxy to Dedicated Cloudflare Auth Worker
  // When an upstream Auth Worker URL is configured, proxy all auth requests to it
  // (ensuring secrets like RESEND_API_KEY and native rate limiting remain strictly confined to the Auth Worker).
  const workerBaseRaw = env.AUTH_WORKER_URL || env.BETTER_AUTH_URL;

  if (workerBaseRaw) {
    if (!isTrustedWorkerUrl(workerBaseRaw)) {
      return NextResponse.json(
        {
          error: 'CONFIGURATION_ERROR',
          message: 'Configured authentication Worker URL is untrusted, malformed, or creates a self-proxy loop',
        },
        { status: 500 }
      );
    }

    try {
      const incomingUrl = new URL(request.url);
      const workerUrl = new URL(workerBaseRaw);

      // Self-Proxy Loop Prevention: Upstream Worker must not match incoming request host
      if (workerUrl.host.toLowerCase() === incomingUrl.host.toLowerCase()) {
        return NextResponse.json(
          {
            error: 'CONFIGURATION_ERROR',
            message: 'Configured auth upstream host matches incoming frontend host, creating an accidental proxy loop',
          },
          { status: 500 }
        );
      }

      // Validate and sanitize path to prevent SSRF and path traversal
      const pathname = incomingUrl.pathname;
      if (
        !pathname.startsWith('/api/auth') ||
        pathname.includes('//') ||
        pathname.includes('\\') ||
        pathname.includes('%2f') ||
        pathname.includes('%2F')
      ) {
        return NextResponse.json(
          { error: 'BAD_REQUEST', message: 'Invalid or prohibited request path' },
          { status: 400 }
        );
      }

      const workerOrigin = workerUrl.origin;
      const targetUrl = new URL(pathname + incomingUrl.search, workerOrigin);

      // Verify targetUrl has not escaped the trusted worker origin (SSRF defense)
      if (targetUrl.origin !== workerOrigin) {
        return NextResponse.json(
          { error: 'BAD_REQUEST', message: 'Target URL origin mismatch' },
          { status: 400 }
        );
      }

      // Origin header validation:
      const incomingOrigin = request.headers.get('origin');
      const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method.toUpperCase());

      if (incomingOrigin) {
        if (!isTrustedFrontendOrigin(incomingOrigin, env)) {
          return NextResponse.json(
            { error: 'FORBIDDEN', message: 'Untrusted or unapproved request origin' },
            { status: 403 }
          );
        }
      } else if (isStateChangingMethod) {
        // State-changing requests lacking an Origin header:
        // Modern browsers provide Origin on CORS / fetch / XHR POST requests.
        // For state-changing requests where Origin is omitted, validate Referer origin.
        const referer = request.headers.get('referer');
        if (referer) {
          try {
            const refererOrigin = new URL(referer).origin;
            if (!isTrustedFrontendOrigin(refererOrigin, env)) {
              return NextResponse.json(
                { error: 'FORBIDDEN', message: 'Untrusted referer origin on state-changing request' },
                { status: 403 }
              );
            }
          } catch {
            return NextResponse.json(
              { error: 'FORBIDDEN', message: 'Malformed referer header' },
              { status: 403 }
            );
          }
        }
        // Note: Better Auth also verifies internal anti-CSRF state tokens on sensitive endpoints.
      }
      // Top-level GET / HEAD requests legitimately have no Origin header (standard browser navigation)

      // Forward headers safely: strip hop-by-hop headers
      const forwardHeaders = new Headers();
      request.headers.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        if (!HOP_BY_HOP_HEADERS.has(lowerKey) && lowerKey !== 'host') {
          forwardHeaders.set(key, val);
        }
      });

      // Explicitly set trusted upstream Host header
      forwardHeaders.set('host', workerUrl.host);

      // Explicitly set Origin: use verified incoming origin or incoming request origin
      const effectiveOrigin = incomingOrigin || incomingUrl.origin;
      forwardHeaders.set('origin', effectiveOrigin);

      const fetchOptions = {
        method: request.method,
        headers: forwardHeaders,
        redirect: 'manual', // Preserve 302 redirects for callback handling
      };

      if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
        fetchOptions.body = await request.arrayBuffer();
      }

      const workerRes = await fetch(targetUrl.toString(), fetchOptions);

      // Construct Next.js Response preserving safe headers and sanitized Set-Cookie
      const resHeaders = new Headers();

      // Collect Set-Cookie headers properly across runtimes without corrupting multiple cookies
      const rawCookies = extractSetCookieHeaders(workerRes);
      for (const cookieStr of rawCookies) {
        const sanitized = sanitizeSetCookieHeader(cookieStr);
        if (sanitized) {
          resHeaders.append('set-cookie', sanitized);
        }
      }

      // Forward other non-hop-by-hop headers (strip content-encoding and content-length as body is decompressed by fetch)
      workerRes.headers.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey !== 'set-cookie' &&
          lowerKey !== 'content-encoding' &&
          lowerKey !== 'content-length' &&
          !HOP_BY_HOP_HEADERS.has(lowerKey)
        ) {
          resHeaders.set(key, val);
        }
      });

      // Handle Location header for redirects (Prevent open redirects)
      const location = workerRes.headers.get('location');
      if (location) {
        try {
          const locUrl = new URL(location, workerBaseRaw);
          if (locUrl.origin === workerOrigin) {
            // Rewrite upstream Worker redirect to Next.js frontend origin
            const localLoc = new URL(locUrl.pathname + locUrl.search, incomingUrl.origin);
            resHeaders.set('location', localLoc.toString());
          } else if (isTrustedFrontendOrigin(locUrl.origin, env)) {
            // Already points to an authorized frontend origin
            resHeaders.set('location', locUrl.toString());
          } else {
            // Untrusted external redirect target: rewrite to frontend login error
            const safeRedirect = new URL('/login?error=invalid_redirect', incomingUrl.origin);
            resHeaders.set('location', safeRedirect.toString());
          }
        } catch {
          resHeaders.set('location', new URL('/login?error=invalid_redirect', incomingUrl.origin).toString());
        }
      }

      const body = await workerRes.arrayBuffer();
      return new NextResponse(body, {
        status: workerRes.status,
        statusText: workerRes.statusText,
        headers: resHeaders,
      });
    } catch (err) {
      return NextResponse.json(
        {
          error: 'AUTH_GATEWAY_ERROR',
          message: 'Failed to communicate with authentication Worker backend',
        },
        { status: 502 }
      );
    }
  }

  // Mode A: Direct D1 Binding (Fallback when no dedicated Auth Worker is configured)
  if (isD1Binding(env.DB)) {
    return handleEdgeAuthRequest(request, env);
  }

  // Mode C: Fail closed if no auth backend is configured
  return NextResponse.json(
    {
      error: 'AUTH_BACKEND_UNAVAILABLE',
      message: 'Authentication backend is not configured on this environment',
    },
    { status: 503 }
  );
}

export async function GET(request) {
  return handleAuth(request);
}

export async function POST(request) {
  return handleAuth(request);
}

export async function PUT(request) {
  return handleAuth(request);
}

export async function DELETE(request) {
  return handleAuth(request);
}
