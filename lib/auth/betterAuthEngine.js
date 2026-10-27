/**
 * lib/auth/betterAuthEngine.js
 *
 * Cloudflare Worker-compatible Better Auth Engine Foundation.
 *
 * Core Principles:
 * 1. Zero Native SQLite Dependencies: No native C++ sqlite bindings or Node-only drivers.
 * 2. Explicit D1 Binding: Cloudflare D1 database binding (`env.DB`) must be provided explicitly.
 * 3. Pure ESM: Compatible with Cloudflare Workers isolate execution and Node ESM.
 * 4. Resend HTTP Transport: Dispatches passwordless magic-link authentication via Resend REST API.
 * 5. Multi-Provider OAuth: Supports Google, Facebook, Twitter/X, and LinkedIn via explicit env bindings.
 * 6. Defensive Configuration: Validates D1 contract, secrets, and URLs at the initialization boundary.
 */

import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins/magic-link';
import { createResendMagicLinkSender } from './resendTransport.js';

/**
 * Cloudflare D1 required methods definition.
 */
const REQUIRED_D1_METHODS = ['prepare', 'batch', 'exec'];

/**
 * Supported OAuth social providers.
 */
export const SUPPORTED_OAUTH_PROVIDERS = ['google', 'facebook', 'twitter', 'linkedin'];

/**
 * Checks if a given object satisfies the Cloudflare D1 binding contract.
 *
 * @param {unknown} db
 * @returns {boolean}
 */
export function isD1Binding(db) {
  if (!db || typeof db !== 'object') return false;
  return REQUIRED_D1_METHODS.every((method) => typeof db[method] === 'function');
}

let getCloudflareContext = null;
try {
  const cfModule = await import("@opennextjs/cloudflare");
  getCloudflareContext = cfModule.getCloudflareContext;
} catch {}

/**
 * Resolves the actual Cloudflare D1 database binding from supported runtime contexts.
 * Prioritizes:
 * 1. Injected candidate (if conforming D1 binding object)
 * 2. Supported Cloudflare Worker / OpenNext runtime context (getCloudflareContext().env.DB)
 * 3. Global test / runtime mocks (globalThis.__D1_DATABASE__, globalThis.DB)
 * 4. process.env.DB ONLY if it is an actual conforming D1 binding object (never strings like "true")
 *
 * @param {unknown} [candidate]
 * @returns {object|null} Conforming D1 database binding or null
 */
export function getRuntimeD1Binding(candidate = null) {
  // 1. Injected candidate
  if (candidate && typeof candidate === 'object') {
    if (isD1Binding(candidate) || (typeof candidate.prepare === 'function' && typeof candidate.batch === 'function')) {
      return candidate;
    }
  }

  // 2. OpenNext Cloudflare runtime context
  try {
    if (getCloudflareContext) {
      const ctx = getCloudflareContext();
      if (ctx?.env?.DB && typeof ctx.env.DB === 'object' && typeof ctx.env.DB.prepare === 'function') {
        return ctx.env.DB;
      }
    }
  } catch {}

  // 3. Global test / isolate environments
  if (typeof globalThis !== 'undefined') {
    if (globalThis.__D1_DATABASE__ && typeof globalThis.__D1_DATABASE__ === 'object' && typeof globalThis.__D1_DATABASE__.prepare === 'function') {
      return globalThis.__D1_DATABASE__;
    }
    if (globalThis.DB && typeof globalThis.DB === 'object' && typeof globalThis.DB.prepare === 'function') {
      return globalThis.DB;
    }
  }

  // 4. Safe process.env.DB check - NEVER assume process.env.DB is an object,
  // and NEVER treat a string (e.g., "true", "local-auth-d1-placeholder") as a D1 binding.
  try {
    if (typeof process !== 'undefined' && process?.env?.DB && typeof process.env.DB !== 'string') {
      if (typeof process.env.DB === 'object' && typeof process.env.DB.prepare === 'function') {
        return process.env.DB;
      }
    }
  } catch {}

  return null;
}

/**
 * Validates that the provided object conforms to Cloudflare's D1 Database binding specification.
 * Throws a descriptive, defensive error if the binding is missing or malformed.
 *
 * @param {unknown} db
 * @throws {TypeError|Error}
 * @returns {boolean}
 */
export function validateD1Binding(db) {
  if (!db || typeof db !== 'object') {
    throw new TypeError(
      `D1 binding contract violation: expected a Cloudflare D1 database instance, received ${
        db === null ? 'null' : typeof db
      }`
    );
  }

  const missing = REQUIRED_D1_METHODS.filter((method) => typeof db[method] !== 'function');
  if (missing.length > 0) {
    throw new Error(
      `D1 binding contract violation: missing required Cloudflare D1 method(s): ${missing.join(', ')}`
    );
  }

  return true;
}

/**
 * Validates and normalizes URL strings.
 *
 * @param {string} urlStr
 * @returns {string} Normalized URL
 */
export function normalizeBaseURL(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    throw new Error('BETTER_AUTH_URL is required: provide a valid base URL (e.g., https://shedbody.com)');
  }
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol for BETTER_AUTH_URL: "${parsed.protocol}" (must be http: or https:)`);
    }
    return parsed.origin;
  } catch (err) {
    throw new Error(`Invalid BETTER_AUTH_URL format: "${urlStr}" (${err.message})`);
  }
}

/**
 * Constructs the canonical OAuth callback URL for a given provider.
 *
 * @param {string} baseURL
 * @param {string} providerId
 * @returns {string} e.g. https://shedbody.com/api/auth/callback/google
 */
export function getOAuthCallbackURL(baseURL, providerId) {
  if (!SUPPORTED_OAUTH_PROVIDERS.includes(providerId)) {
    throw new Error(`Unsupported OAuth provider: "${providerId}". Expected one of: ${SUPPORTED_OAUTH_PROVIDERS.join(', ')}`);
  }
  const origin = normalizeBaseURL(baseURL);
  return `${origin}/api/auth/callback/${providerId}`;
}

/**
 * Resolves and validates social provider configurations from runtime environment bindings.
 * Optional providers are only enabled when BOTH clientId and clientSecret are present.
 * Incomplete credentials throw a descriptive, secret-safe configuration error.
 *
 * @param {object} [env={}]
 * @param {object} [options={}]
 * @returns {{ socialProviders: object, configuredProviders: string[] }}
 */
export function resolveSocialProviders(env = {}, options = {}) {
  const providerDefs = [
    {
      id: 'google',
      name: 'Google',
      clientId: options.googleClientId || env.GOOGLE_CLIENT_ID || env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: options.googleClientSecret || env.GOOGLE_CLIENT_SECRET || env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      clientId: options.facebookClientId || env.FACEBOOK_CLIENT_ID || env.FACEBOOK_APP_ID || env.META_CLIENT_ID,
      clientSecret: options.facebookClientSecret || env.FACEBOOK_CLIENT_SECRET || env.FACEBOOK_APP_SECRET || env.META_CLIENT_SECRET,
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      clientId: options.twitterClientId || env.TWITTER_CLIENT_ID || env.X_CLIENT_ID,
      clientSecret: options.twitterClientSecret || env.TWITTER_CLIENT_SECRET || env.X_CLIENT_SECRET,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      clientId: options.linkedinClientId || env.LINKEDIN_CLIENT_ID,
      clientSecret: options.linkedinClientSecret || env.LINKEDIN_CLIENT_SECRET,
    },
  ];

  const socialProviders = {};
  const configuredProviders = [];

  for (const def of providerDefs) {
    const rawId = typeof def.clientId === 'string' ? def.clientId.trim() : def.clientId;
    const rawSecret = typeof def.clientSecret === 'string' ? def.clientSecret.trim() : def.clientSecret;

    const hasId = Boolean(rawId);
    const hasSecret = Boolean(rawSecret);

    if (hasId && !hasSecret) {
      throw new Error(`Incomplete OAuth configuration for ${def.name}: clientSecret is missing when clientId is provided`);
    }
    if (!hasId && hasSecret) {
      throw new Error(`Incomplete OAuth configuration for ${def.name}: clientId is missing when clientSecret is provided`);
    }

    if (hasId && hasSecret) {
      socialProviders[def.id] = {
        clientId: rawId,
        clientSecret: rawSecret,
      };
      configuredProviders.push(def.id);
    }
  }

  // Allow custom overrides via options.socialProviders
  if (options.socialProviders && typeof options.socialProviders === 'object') {
    for (const [key, val] of Object.entries(options.socialProviders)) {
      if (val && typeof val === 'object') {
        socialProviders[key] = {
          ...socialProviders[key],
          ...val,
        };
        if (!configuredProviders.includes(key)) {
          configuredProviders.push(key);
        }
      }
    }
  }

  return { socialProviders, configuredProviders };
}

/**
 * Creates and initializes an isolated Cloudflare-compatible Better Auth instance.
 *
 * @param {object} params
 * @param {object} params.d1 - Cloudflare D1 database binding (e.g., env.DB)
 * @param {object} [params.env={}] - Cloudflare Worker environment variables
 * @param {object} [params.options={}] - Custom configuration overrides
 * @param {Function} [params.fetchFn=globalThis.fetch] - Injected fetch implementation
 * @returns {object} Better Auth instance
 */
export function createBetterAuthEngine({
  d1,
  env = {},
  options = {},
  fetchFn = globalThis.fetch,
}) {
  // 1. Defensively validate Cloudflare D1 binding
  validateD1Binding(d1);

  // 2. Resolve and validate authentication secret
  const secret = options.secret || env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length < 16) {
    throw new Error(
      'BETTER_AUTH_SECRET is required: provide a secure secret of at least 16 characters via env or options.secret'
    );
  }

  // 3. Resolve and validate baseURL
  const rawBaseURL = options.baseURL || env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL;
  const baseURL = normalizeBaseURL(rawBaseURL);

  // 4. Resolve Magic Link sender (Resend or custom injected handler)
  let sendMagicLinkHandler = options.sendMagicLink;

  if (!sendMagicLinkHandler) {
    const resendApiKey = options.resendApiKey || env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!resendApiKey || typeof resendApiKey !== 'string' || resendApiKey.trim().length === 0) {
      throw new Error(
        'Magic Link configuration error: RESEND_API_KEY is required when options.sendMagicLink is not provided'
      );
    }

    const emailFrom =
      options.emailFrom ||
      env.AUTH_EMAIL_FROM ||
      process.env.AUTH_EMAIL_FROM ||
      'ShedBody <auth@shedbody.com>';

    const appName = options.appName || 'ShedBody';
    const expiresInMinutes = options.magicLinkExpiresInMinutes || 10;
    const appUrl = options.appUrl || env.APP_URL || env.NEXT_PUBLIC_APP_URL || (typeof process !== 'undefined' ? (process.env?.APP_URL || process.env?.NEXT_PUBLIC_APP_URL) : undefined);

    sendMagicLinkHandler = createResendMagicLinkSender({
      apiKey: resendApiKey,
      fromEmail: emailFrom,
      appName,
      expiresInMinutes,
      fetchFn: options.fetchFn || fetchFn,
      appUrl,
    });
  }

  const appUrl = options.appUrl || env.APP_URL || env.NEXT_PUBLIC_APP_URL || (typeof process !== 'undefined' ? (process.env?.APP_URL || process.env?.NEXT_PUBLIC_APP_URL) : undefined);
  const rawSender = sendMagicLinkHandler;
  const finalSendMagicLink = async (data) => {
    let finalUrl = data.url;
    if (appUrl && data.url) {
      try {
        const parsed = new URL(data.url);
        const target = new URL(appUrl);
        parsed.protocol = target.protocol;
        parsed.host = target.host;
        parsed.port = target.port;
        finalUrl = parsed.toString();
      } catch {}
    }
    return rawSender({ ...data, url: finalUrl });
  };

  // 5. Resolve OAuth social providers
  const { socialProviders, configuredProviders } = resolveSocialProviders(env, options);

  // 6. Build Better Auth configuration
  const magicLinkPlugin = magicLink({
    sendMagicLink: finalSendMagicLink,
    expiresIn: (options.magicLinkExpiresInMinutes || 10) * 60,
    storeToken: options.magicLinkStoreToken || 'hashed',
  });

  const isTestEnv =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') ||
    options.validateSchema === false;

  const authConfig = {
    database: d1,
    secret: secret.trim(),
    baseURL,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes cache
      },
    },
    advanced: {
      database: {
        // In unit test mocks or when D1 schema is pre-migrated, skip runtime schema introspection
        validateSchema: !isTestEnv,
      },
      ...options.advanced,
    },
    plugins: [magicLinkPlugin, ...(options.plugins || [])],
  };

  // Resolve trustedOrigins (allowing frontend hosts to receive auth redirects)
  const rawTrusted = options.trustedOrigins || env.BETTER_AUTH_TRUSTED_ORIGINS;
  const trustedOrigins = Array.isArray(rawTrusted)
    ? rawTrusted
    : typeof rawTrusted === 'string'
    ? rawTrusted.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  if (Array.isArray(trustedOrigins) && trustedOrigins.length > 0) {
    authConfig.trustedOrigins = trustedOrigins;
  }

  // Only attach socialProviders if at least one provider was configured
  if (configuredProviders.length > 0) {
    authConfig.socialProviders = socialProviders;
  }

  // 7. Instantiate Better Auth
  return betterAuth(authConfig);
}
