/**
 * lib/auth/edgeAuthHandler.js
 *
 * Isolated Cloudflare Worker Edge Handler for Better Auth.
 * Accepts Cloudflare Worker fetch event parameters `(request, env, ctx)`.
 *
 * Security & Isolation Guarantees:
 * 1. Cloudflare D1 binding is taken strictly from `env.DB` (never from `process.env.DB`).
 * 2. Secrets and OAuth credentials are taken strictly from `env` (never hardcoded).
 * 3. Sanitizes all error messages to ensure credentials, tokens, and database details are never leaked.
 * 4. Completely isolated from the existing Vercel production authentication paths.
 */

import { createBetterAuthEngine, isD1Binding } from './betterAuthEngine.js';

/**
 * Sanitizes error messages to prevent credential and internal detail leakage.
 *
 * @param {string} msg
 * @returns {string}
 */
function sanitizeErrorMessage(msg) {
  if (typeof msg !== 'string') return 'Authentication request failed';
  return msg
    .replace(/re_[a-zA-Z0-9_]{10,}/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]')
    .replace(/[a-zA-Z0-9_\-]{30,}/g, '[REDACTED_TOKEN]');
}

/**
 * Handles incoming HTTP requests for authentication at the Cloudflare Worker edge.
 *
 * @param {Request} request - Standard Fetch Request
 * @param {object} env - Cloudflare Worker environment bindings
 * @param {object} [ctx={}] - Cloudflare Worker execution context (e.g., ctx.waitUntil)
 * @param {object} [options={}] - Custom options overrides (e.g. for testing)
 * @returns {Promise<Response>}
 */
export async function handleEdgeAuthRequest(request, env = {}, ctx = {}, options = {}) {
  // 1. Defensively verify request parameter
  if (!request || typeof request.url !== 'string') {
    return new Response(
      JSON.stringify({
        error: 'BAD_REQUEST',
        message: 'A valid Request object is required',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. Strict isolate contract: D1 binding must arrive via Worker env parameter, NEVER process.env
  if (!env || !env.DB || !isD1Binding(env.DB)) {
    return new Response(
      JSON.stringify({
        error: 'CONFIGURATION_ERROR',
        message: 'Cloudflare D1 database binding (env.DB) is missing or invalid on Worker runtime environment',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Strict isolate contract: BETTER_AUTH_SECRET must be present on Worker env
  const secret = options.secret || env.BETTER_AUTH_SECRET;
  if (!secret) {
    return new Response(
      JSON.stringify({
        error: 'CONFIGURATION_ERROR',
        message: 'BETTER_AUTH_SECRET is required on Worker runtime environment',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 4. Instantiate isolated Better Auth engine for this request
  let auth;
  try {
    auth = createBetterAuthEngine({
      d1: env.DB,
      env,
      options,
      fetchFn: options.fetchFn || globalThis.fetch,
    });
  } catch (err) {
    const safeMsg = sanitizeErrorMessage(err?.message);
    return new Response(
      JSON.stringify({
        error: 'INITIALIZATION_ERROR',
        message: safeMsg,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 5. Dispatch request to Better Auth request handler
  try {
    return await auth.handler(request);
  } catch (err) {
    const safeMsg = sanitizeErrorMessage(err?.message);
    return new Response(
      JSON.stringify({
        error: 'HANDLER_ERROR',
        message: safeMsg,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Standard Cloudflare Worker export module.
 */
export default {
  async fetch(request, env, ctx) {
    if (env?.ENABLE_BETTER_AUTH !== 'true' && env?.ENABLE_CF_AUTH !== 'true') {
      return new Response(
        JSON.stringify({
          error: 'AUTH_BACKEND_DISABLED',
          message: 'Better Auth is disabled by server configuration',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handleEdgeAuthRequest(request, env, ctx);
  },
};
