/**
 * lib/auth/sessionResolver.js
 *
 * Unified Server-Side Session Resolver for ShedBody Next.js Application.
 *
 * Architectural Invariants:
 * 1. Zero Trust of Client Claims: User IDs, roles, and session validity are never
 *    inferred from client payloads or unverified headers.
 * 2. Fail-Closed Design: Returns null if the session cookie is missing, expired,
 *    malformed, or if the authentication service is unreachable/disabled (e.g. HTTP 503).
 * 3. Dual Runtime Support:
 *    - Cloudflare Runtime (Worker/Pages/OpenNext): Validates directly against D1 if binding exists.
 *    - Vercel Node.js Runtime: Authenticates via server-to-Worker GET /api/auth/get-session request.
 * 4. Zero Secret Leakage: Session tokens and raw cookie headers are never logged or exposed.
 * 5. Sanitized Identity: Returns only safe, normalized user identity fields.
 */

import { extractSessionToken, isSessionExpired, validateD1Session } from './sessionValidator.js';
import { isD1Binding, getRuntimeD1Binding } from './betterAuthEngine.js';

/**
 * Resolves the authenticated user session from a server-side request context.
 *
 * @param {object} [options={}]
 * @param {string} [options.cookieHeader] - Raw Cookie header string (optional override)
 * @param {object} [options.cookieStore] - Next.js cookies() object (optional override)
 * @param {object} [options.d1] - Cloudflare D1 database binding (optional override)
 * @param {string} [options.authWorkerUrl] - Base URL of the auth Worker (e.g. process.env.AUTH_WORKER_URL)
 * @param {Function} [options.fetchFn=globalThis.fetch] - Injected fetch implementation
 * @param {number} [options.timeoutMs=3000] - Request timeout in milliseconds
 * @returns {Promise<{ user: object, session: object }|null>}
 */
export async function resolveServerSession(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  const timeoutMs = options.timeoutMs || 3000;

  // 1. Extract session token from provided cookieStore, header, or next/headers
  let cookieHeader = options.cookieHeader;
  let token = null;

  if (options.cookieStore) {
    token = extractSessionToken(options.cookieStore);
    if (token) {
      const secureMatch = options.cookieStore.get?.('__Secure-better-auth.session_token');
      const cookieName = secureMatch ? '__Secure-better-auth.session_token' : 'better-auth.session_token';
      cookieHeader = `${cookieName}=${encodeURIComponent(token)}`;
    }
  } else if (cookieHeader) {
    token = extractSessionToken(cookieHeader);
  } else if (typeof window === 'undefined') {
    // Attempt dynamic Next.js next/headers cookies() lookup
    try {
      const { cookies } = await import('next/headers');
      const store = await cookies();
      token = extractSessionToken(store);
      if (token) {
        const secureMatch = store.get('__Secure-better-auth.session_token');
        const cookieName = secureMatch ? '__Secure-better-auth.session_token' : 'better-auth.session_token';
        cookieHeader = `${cookieName}=${encodeURIComponent(token)}`;
      }
    } catch {
      // Outside active Next.js request context (e.g., unit test without mock)
    }
  }

  // Fast fail-closed: No session token present in cookies
  if (!token) {
    return null;
  }

  // 2. Direct Cloudflare D1 Path (Applicable when a verified D1 binding is present)
  const d1 = getRuntimeD1Binding(options.d1);
  if (isD1Binding(d1)) {
    try {
      const result = await validateD1Session(d1, token);
      if (result) {
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || '',
            emailVerified: Boolean(result.user.emailVerified),
            image: result.user.image || null,
          },
          session: {
            id: result.session.id,
            userId: result.session.userId,
            expiresAt: result.session.expiresAt,
          },
        };
      }
    } catch {
      // Direct D1 execution error; fall through to server-to-worker path if configured
    }
  }

  // 3. Server-to-Worker Path (Standard for Vercel and remote Next.js runtimes)
  const rawWorkerUrl =
    options.authWorkerUrl ||
    (typeof process !== 'undefined' && (process.env?.AUTH_WORKER_URL || process.env?.BETTER_AUTH_URL));

  if (!rawWorkerUrl) {
    return null; // Fail closed if no Worker URL is configured (prevent self-loop to frontend)
  }

  let workerBase;
  try {
    const parsed = new URL(rawWorkerUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    if (parsed.username || parsed.password) {
      return null;
    }
    workerBase = parsed.origin;
  } catch {
    return null; // Malformed worker URL configuration: fail closed
  }

  const endpoint = `${workerBase}/api/auth/get-session`;
  const appOrigin =
    (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_APP_URL || process.env?.VERCEL_URL))
      ? (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`)
      : 'https://shedbody.com';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchFn(endpoint, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
        Accept: 'application/json',
        Origin: appOrigin,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    // Fail closed on non-200 responses (e.g. HTTP 503 Worker disabled, 401 unauthenticated, 500 server error)
    if (!res.ok) {
      return null;
    }

    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Validate minimum required payload structure from Better Auth
    if (!data.session || !data.user || typeof data.user.id !== 'string' || !data.user.id.trim()) {
      return null;
    }

    // Verify session expiration defensively
    if (isSessionExpired(data.session.expiresAt)) {
      return null;
    }

    // Return strictly sanitized, trusted identity
    return {
      user: {
        id: data.user.id.trim(),
        email: data.user.email ? String(data.user.email).trim().toLowerCase() : '',
        name: data.user.name ? String(data.user.name).trim() : '',
        emailVerified: Boolean(data.user.emailVerified),
        image: data.user.image || null,
      },
      session: {
        id: data.session.id,
        userId: data.session.userId,
        expiresAt: new Date(data.session.expiresAt),
      },
    };
  } catch {
    // Fail closed on network failure, timeout (AbortError), or connection refusal
    clearTimeout(timer);
    return null;
  }
}
