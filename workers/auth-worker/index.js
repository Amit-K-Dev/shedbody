/**
 * workers/auth-worker/index.js
 *
 * Dedicated Cloudflare Worker Entry Point for Better Auth (CF-4B).
 *
 * Security Invariants:
 * 1. Opt-in Feature Flag: Execution is disabled unless ENABLE_CF_AUTH === "true".
 * 2. Strict Isolate Binding: D1 binding is accepted only via Worker `env.DB`.
 * 3. Secret Redaction: Errors and responses never leak private keys, tokens, or client secrets.
 * 4. Production Safety: Supabase production routes remain completely unaffected.
 */

import { handleEdgeAuthRequest } from '../../lib/auth/edgeAuthHandler.js';
import { validateEmail } from '../../lib/auth/resendTransport.js';

export async function handleAuthWorkerRequest(request, env = {}, ctx = {}, options = {}) {
  const url = new URL(request.url);

  // Healthcheck endpoint for monitoring and preflight validation
  if (url.pathname === '/api/auth/health' || url.pathname === '/health') {
    const isEnabled = env.ENABLE_CF_AUTH === 'true';
    return new Response(
      JSON.stringify({
        status: isEnabled ? 'active' : 'disabled',
        service: 'shedbody-auth-worker',
        enabled: isEnabled,
        hasD1Binding: Boolean(env.DB),
      }),
      {
        status: isEnabled ? 200 : 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Enforce opt-in feature flag (Strictly default-off)
  if (env.ENABLE_CF_AUTH !== 'true') {
    return new Response(
      JSON.stringify({
        error: 'CF_AUTH_DISABLED',
        message: 'Cloudflare Authentication Worker is disabled by configuration (ENABLE_CF_AUTH !== "true")',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Staging recipient allowlist guard for magic-link requests
  const isMagicLinkSignIn =
    request.method === 'POST' &&
    url.pathname.replace(/\/$/, '') === '/api/auth/sign-in/magic-link';

  if (isMagicLinkSignIn) {
    // Defensive email normalization: trim whitespace and lowercase before validation and engine dispatch
    try {
      const cloned = request.clone();
      const rawBody = await cloned.json();
      if (rawBody && typeof rawBody === 'object' && typeof rawBody.email === 'string') {
        const cleanEmail = rawBody.email.trim().toLowerCase();
        if (cleanEmail !== rawBody.email) {
          rawBody.email = cleanEmail;
          request = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(rawBody),
          });
        }
      }
    } catch {}

    const isStaging =
      env.ENVIRONMENT === 'staging' ||
      options.environment === 'staging' ||
      env.APP_ENV === 'staging' ||
      (typeof env.BETTER_AUTH_URL === 'string' && env.BETTER_AUTH_URL.includes('staging'));

    const rawAllowlist = options.allowedRecipients !== undefined
      ? options.allowedRecipients
      : env.AUTH_ALLOWED_RECIPIENTS;

    // Helper to safely parse and validate comma-separated allowed emails
    const parseAllowlist = (input) => {
      if (typeof input !== 'string') return null;
      const trimmed = input.trim();
      if (!trimmed) return null;
      const emails = trimmed
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const valid = emails.filter((e) => validateEmail(e));
      return { total: emails.length, valid };
    };

    // In staging, authentication must fail closed if allowlist is missing, empty, malformed, or contains no valid addresses
    if (isStaging) {
      const parsed = parseAllowlist(rawAllowlist);
      if (!parsed || parsed.valid.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'CONFIGURATION_ERROR',
            message: 'Staging recipient allowlist must contain at least one valid email address when authentication is enabled',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // If an allowlist is configured (on staging or explicitly passed on another environment)
    if (rawAllowlist !== undefined && rawAllowlist !== null) {
      const parsed = parseAllowlist(rawAllowlist);
      if (!parsed || parsed.valid.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'CONFIGURATION_ERROR',
            message: 'Recipient allowlist configuration is invalid or contains no valid email addresses',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      let body;
      try {
        const cloned = request.clone();
        body = await cloned.json();
      } catch {
        return new Response(
          JSON.stringify({
            error: 'BAD_REQUEST',
            message: 'Invalid JSON payload in request body',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Reject missing email or invalid email format consistently with HTTP 400
      if (!body || typeof body !== 'object' || typeof body.email !== 'string' || !validateEmail(body.email)) {
        return new Response(
          JSON.stringify({
            error: 'BAD_REQUEST',
            message: 'A valid email address is required in the request body',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      let normalizedEmail = null;
      if (body && typeof body === 'object' && typeof body.email === 'string' && validateEmail(body.email)) {
        normalizedEmail = body.email.trim().toLowerCase();
      }

      // Reject valid but unauthorized email addresses with HTTP 403
      if (!parsed.valid.includes(normalizedEmail)) {
        return new Response(
          JSON.stringify({
            error: 'RECIPIENT_NOT_ALLOWED',
            message: 'Recipient email is not permitted on this environment',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Rate limiting: applies to authentication flow for valid requests
    // Runs AFTER allowlist check and BEFORE Better Auth / D1 / Resend dispatch
    const limiter = options.rateLimiter || env.RATE_LIMITER;

    // Fail closed if distributed rate limiter service is required but unavailable in staging
    if (isStaging && (!limiter || typeof limiter.limit !== 'function')) {
      return new Response(
        JSON.stringify({
          error: 'CONFIGURATION_ERROR',
          message: 'Rate limiter binding (env.RATE_LIMITER) is required when staging authentication is enabled',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (limiter && typeof limiter.limit === 'function') {
      // Trustworthy client IP: CF-Connecting-IP exclusively (do not trust arbitrary client headers)
      const rawIp = request.headers.get('cf-connecting-ip');
      const isIpv4 = typeof rawIp === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(rawIp.trim());
      const isIpv6 = typeof rawIp === 'string' && /^[0-9a-fA-F:]+$/.test(rawIp.trim()) && rawIp.includes(':');
      const safeIp = (isIpv4 || isIpv6) ? rawIp.trim() : 'untrusted';

      // Parse normalized email for recipient-level rate limiting if not already parsed
      let targetEmail = null;
      try {
        const cloned = request.clone();
        const body = await cloned.json();
        if (body && typeof body.email === 'string' && validateEmail(body.email)) {
          targetEmail = body.email.trim().toLowerCase();
        }
      } catch {}

      const envPrefix = isStaging ? 'staging' : (env.ENVIRONMENT || 'prod');
      const ipKey = `${envPrefix}:magic-link:ip:${safeIp}`;

      try {
        // Limit repeated requests from one client/IP
        const ipResult = await limiter.limit({ key: ipKey });
        if (!ipResult || ipResult.success === false) {
          return new Response(
            JSON.stringify({
              error: 'TOO_MANY_REQUESTS',
              message: 'Too many requests. Please try again later.',
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60',
              },
            }
          );
        }

        // Limit repeated requests for the recipient if email is present
        if (targetEmail) {
          const emailKey = `${envPrefix}:magic-link:email:${targetEmail}`;
          const emailResult = await limiter.limit({ key: emailKey });
          if (!emailResult || emailResult.success === false) {
            return new Response(
              JSON.stringify({
                error: 'TOO_MANY_REQUESTS',
                message: 'Too many requests. Please try again later.',
              }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  'Retry-After': '60',
                },
              }
            );
          }
        }
      } catch {
        // Fail safely if distributed rate limit service is unavailable; do not silently allow unrestricted sending
        return new Response(
          JSON.stringify({
            error: 'RATE_LIMIT_UNAVAILABLE',
            message: 'Rate limiting service is temporarily unavailable. Please try again later.',
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
      }
    }
  }

  // Delegate request to isolated edge auth handler
  const delegate = options.handleEdgeAuthRequest || handleEdgeAuthRequest;
  return delegate(request, env, ctx, options);
}

export default {
  async fetch(request, env, ctx) {
    return handleAuthWorkerRequest(request, env, ctx);
  },
};
