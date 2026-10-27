// lib/auth/edgeJwtVerifier.js
/**
 * ShedBody — Hardened Edge-Compatible Supabase JWT Verifier
 *
 * Implements strict, server-side JWT verification using the standard Web Crypto API.
 * Compatible with Cloudflare Workers isolates (no Node-only globals or dependencies)
 * and Node.js 18+ runtimes.
 *
 * Invariants & Hardening (CF-10A.1):
 * 1. Supabase Auth remains the sole identity authority.
 * 2. Strict algorithm allowlist: only explicitly configured algorithms are accepted.
 *    Rejects 'none', unset, or mismatched algorithms immediately. Never downgrades.
 * 3. Supports symmetric (HS256) and asymmetric (RS256, ES256 via JWKS) verification safely.
 * 4. Never trusts caller-supplied claims prior to cryptographic signature validation.
 * 5. Full claims validation:
 *    - exp: strictly required, positive finite number, rejects expired tokens (bounded clock skew).
 *    - nbf: if present, rejects future-dated tokens.
 *    - aud: strictly required, validates against expected audience (default: 'authenticated').
 *    - iss: strictly required, non-empty, validates against expected issuer when configured.
 *    - sub: strictly required, validates strictly against RFC 4122 UUID regex.
 * 6. Fails closed on missing or invalid verifier configuration (no fallback to unverified decoding).
 * 7. Key ID (kid) lookup against trusted JWKS with safe on-demand cache refresh for unknown kids.
 * 8. Never exposes secrets, keys, raw tokens, or PII in thrown error messages or outputs.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// In-memory key cache for asymmetric JWKS keys: Map<string, { cryptoKey: CryptoKey, cachedAt: number }>
const jwksCryptoKeyCache = new Map();
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Rate limiting & negative caching to prevent uncontrolled outbound JWKS fetches
let lastJwksFetchTimestamp = 0;
const unknownKidNegativeCache = new Map();
const UNKNOWN_KID_TTL_MS = 30 * 1000; // 30 seconds negative cache
const DEFAULT_MIN_JWKS_FETCH_INTERVAL_MS = 10 * 1000; // 10 seconds fetch throttle

/**
 * Constant-time string comparison to prevent timing side-channel attacks on secrets.
 * @param {string} a 
 * @param {string} b 
 * @returns {boolean}
 */
export function safeTimingCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Base64URL decode string to standard UTF-8 string.
 * @param {string} str 
 * @returns {string}
 */
export function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * Base64URL encode a string or Uint8Array.
 * @param {string|Uint8Array} input 
 * @returns {string}
 */
export function base64UrlEncode(input) {
  let binary = '';
  if (typeof input === 'string') {
    binary = btoa(input);
  } else {
    const bytes = new Uint8Array(input);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    binary = btoa(binary);
  }
  return binary.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a Base64URL string to a Uint8Array byte buffer.
 * @param {string} str 
 * @returns {Uint8Array}
 */
export function base64UrlToBytes(str) {
  const binary = base64UrlDecode(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Clears the JWKS key cache and negative fetch cooldowns (useful for test isolation).
 */
export function clearJwksCache() {
  jwksCryptoKeyCache.clear();
  unknownKidNegativeCache.clear();
  lastJwksFetchTimestamp = 0;
}

/**
 * Imports a JWK public key into a Web Crypto CryptoKey for signature verification.
 * Enforces algorithm, key type, curve, and key usage compatibility.
 * @param {object} jwk 
 * @param {string} alg 
 * @returns {Promise<CryptoKey>}
 */
async function importJwkToCryptoKey(jwk, alg) {
  if (!jwk || typeof jwk !== 'object') {
    const err = new Error("Malformed JWK: Expected an object");
    err.code = "MALFORMED_JWK";
    throw err;
  }

  if (alg === 'RS256') {
    if (jwk.kty !== 'RSA') {
      const err = new Error(`Key type mismatch for RS256: Expected kty 'RSA', found '${jwk.kty}'`);
      err.code = "INVALID_KEY_TYPE";
      throw err;
    }
    if (jwk.alg && jwk.alg !== 'RS256') {
      const err = new Error(`Algorithm mismatch on JWK: Expected 'RS256', found '${jwk.alg}'`);
      err.code = "ALGORITHM_MISMATCH";
      throw err;
    }
    if (jwk.use && jwk.use !== 'sig') {
      const err = new Error(`Key usage mismatch: Expected use 'sig', found '${jwk.use}'`);
      err.code = "KEY_USAGE_MISMATCH";
      throw err;
    }

    try {
      return await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
    } catch {
      const err = new Error("Failed to import RSA JWK: Malformed key parameters");
      err.code = "MALFORMED_JWK";
      throw err;
    }
  }

  if (alg === 'ES256') {
    if (jwk.kty !== 'EC') {
      const err = new Error(`Key type mismatch for ES256: Expected kty 'EC', found '${jwk.kty}'`);
      err.code = "INVALID_KEY_TYPE";
      throw err;
    }
    if (jwk.crv !== 'P-256') {
      const err = new Error(`Curve mismatch for ES256: Expected crv 'P-256', found '${jwk.crv}'`);
      err.code = "UNSUPPORTED_CURVE";
      throw err;
    }
    if (jwk.alg && jwk.alg !== 'ES256') {
      const err = new Error(`Algorithm mismatch on JWK: Expected 'ES256', found '${jwk.alg}'`);
      err.code = "ALGORITHM_MISMATCH";
      throw err;
    }
    if (jwk.use && jwk.use !== 'sig') {
      const err = new Error(`Key usage mismatch: Expected use 'sig', found '${jwk.use}'`);
      err.code = "KEY_USAGE_MISMATCH";
      throw err;
    }

    try {
      return await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );
    } catch {
      const err = new Error("Failed to import EC JWK: Malformed key parameters");
      err.code = "MALFORMED_JWK";
      throw err;
    }
  }

  const err = new Error(`Unsupported asymmetric algorithm '${alg}' for JWK import`);
  err.code = "UNSUPPORTED_ALGORITHM";
  throw err;
}

/**
 * Resolves an asymmetric verification key by key ID (kid) from provided keys or trusted JWKS endpoint.
 *
 * @param {string} kid - Key ID from JWT header.
 * @param {string} alg - Expected algorithm (RS256 or ES256).
 * @param {object} options
 * @param {Array<object>|object} [options.jwksKeys] - Explicit preloaded JWKS keys or { keys: [...] }.
 * @param {string} [options.jwksUrl] - Trusted remote JWKS URL.
 * @param {Function} [options.jwksFetcher] - Optional custom fetcher for testing.
 * @param {number} [options.minJwksFetchIntervalMs] - Minimum milliseconds between outbound fetches.
 * @returns {Promise<CryptoKey>}
 */
async function resolveAsymmetricKey(kid, alg, options = {}) {
  if (!options.jwksKeys && !options.jwksUrl && !options.jwksFetcher) {
    const err = new Error("Server configuration error: No trusted JWKS URL or keys configured for asymmetric verification");
    err.code = "VERIFICATION_CONFIG_ERROR";
    throw err;
  }

  if (options.jwksUrl) {
    if (typeof options.jwksUrl !== 'string') {
      const err = new Error("Server configuration error: jwksUrl must be a string");
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(options.jwksUrl);
    } catch {
      const err = new Error("Server configuration error: jwksUrl is not a valid URL");
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }
    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
      const err = new Error("Server configuration error: jwksUrl must use HTTPS protocol");
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }
  }

  if (!kid || typeof kid !== 'string') {
    const err = new Error("Missing or invalid 'kid' (Key ID) in asymmetric JWT header");
    err.code = "MISSING_KEY_ID";
    throw err;
  }

  const cacheKey = `${alg}:${kid}`;

  // 1. Check in-memory CryptoKey cache
  const cached = jwksCryptoKeyCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < JWKS_CACHE_TTL_MS) {
    return cached.cryptoKey;
  }

  // 2. Check static/preloaded jwksKeys option
  let keysList = [];
  if (options.jwksKeys) {
    keysList = Array.isArray(options.jwksKeys)
      ? options.jwksKeys
      : (Array.isArray(options.jwksKeys.keys) ? options.jwksKeys.keys : []);
    
    const matchingJwk = keysList.find(k => k && k.kid === kid);
    if (matchingJwk) {
      const cryptoKey = await importJwkToCryptoKey(matchingJwk, alg);
      jwksCryptoKeyCache.set(cacheKey, { cryptoKey, cachedAt: Date.now() });
      return cryptoKey;
    }
  }

  // 3. Refresh unknown key from trusted JWKS endpoint
  if (options.jwksUrl || options.jwksFetcher) {
    const minInterval = options.minJwksFetchIntervalMs !== undefined
      ? options.minJwksFetchIntervalMs
      : DEFAULT_MIN_JWKS_FETCH_INTERVAL_MS;

    // 3a. Check negative cache for repeated unknown kid
    const lastCheck = unknownKidNegativeCache.get(cacheKey);
    if (lastCheck && Date.now() - lastCheck < UNKNOWN_KID_TTL_MS) {
      const err = new Error(`Key ID '${kid}' was not found in trusted key set (rate limited)`);
      err.code = "UNKNOWN_KEY_ID";
      throw err;
    }

    // 3b. Throttle outbound JWKS fetches: if a fetch occurred within minInterval, do not re-fetch
    const timeSinceLastFetch = Date.now() - lastJwksFetchTimestamp;
    if (timeSinceLastFetch < minInterval && lastJwksFetchTimestamp > 0) {
      unknownKidNegativeCache.set(cacheKey, Date.now());
      const err = new Error(`Key ID '${kid}' was not found in trusted key set (fetch cooldown active)`);
      err.code = "UNKNOWN_KEY_ID";
      throw err;
    }

    let jwksData;
    try {
      if (options.jwksFetcher) {
        jwksData = await options.jwksFetcher(options.jwksUrl);
      } else {
        const res = await fetch(options.jwksUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) {
          const err = new Error(`Failed to fetch JWKS from trusted endpoint (HTTP ${res.status})`);
          err.code = "JWKS_FETCH_FAILED";
          throw err;
        }
        jwksData = await res.json();
      }
    } catch (fetchErr) {
      if (fetchErr.code === "JWKS_FETCH_FAILED") throw fetchErr;
      const err = new Error("Unable to retrieve trusted JWKS keys from endpoint");
      err.code = "JWKS_FETCH_FAILED";
      throw err;
    }

    lastJwksFetchTimestamp = Date.now();

    if (!jwksData || typeof jwksData !== 'object' || !Array.isArray(jwksData.keys)) {
      const err = new Error("Malformed JWKS response: Expected JSON object with 'keys' array");
      err.code = "MALFORMED_JWKS";
      throw err;
    }

    for (const key of jwksData.keys) {
      if (key && key.kid && (key.alg === alg || !key.alg)) {
        try {
          const imported = await importJwkToCryptoKey(key, alg);
          jwksCryptoKeyCache.set(`${alg}:${key.kid}`, { cryptoKey: imported, cachedAt: Date.now() });
        } catch {
          // Individual malformed key in a multi-key set does not prevent others from importing
        }
      }
    }

    const refreshed = jwksCryptoKeyCache.get(cacheKey);
    if (refreshed) {
      return refreshed.cryptoKey;
    }

    // Record negative cache hit so subsequent requests with this unknown kid don't re-fetch
    unknownKidNegativeCache.set(cacheKey, Date.now());
  }

  // 4. Unknown Key ID fails closed
  const err = new Error(`Key ID '${kid}' was not found in trusted key set`);
  err.code = "UNKNOWN_KEY_ID";
  throw err;
}

/**
 * Verifies a Supabase-issued JWT against a shared secret or trusted JWKS using Web Crypto.
 *
 * @param {string} token - The raw Bearer JWT string.
 * @param {object} options
 * @param {string} [options.jwtSecret] - The Supabase JWT secret (for HS256).
 * @param {string} [options.jwksUrl] - The trusted Supabase JWKS URL (for RS256/ES256).
 * @param {Array<object>|object} [options.jwksKeys] - Explicit JWKS keys or key set for testing.
 * @param {Function} [options.jwksFetcher] - Custom JWKS fetcher for testing.
 * @param {string[]} [options.allowedAlgorithms] - Permitted algorithms. Defaults based on configured keys.
 * @param {string} [options.expectedAudience='authenticated'] - Expected 'aud' claim.
 * @param {string} [options.expectedIssuer] - Expected 'iss' claim (e.g. Supabase Auth URL).
 * @param {number} [options.clockSkewSeconds=30] - Permissible clock skew in seconds.
 * @returns {Promise<object>} The cryptographically verified payload claims.
 */
export async function verifySupabaseJwt(token, options = {}) {
  if (!token || typeof token !== 'string') {
    const err = new Error("Missing or invalid token: Expected non-empty string");
    err.code = "MISSING_TOKEN";
    throw err;
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    const err = new Error("Malformed JWT: Must contain exactly 3 dot-separated segments");
    err.code = "MALFORMED_TOKEN";
    throw err;
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Decode Header
  let header;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
  } catch {
    const err = new Error("Malformed JWT header: Base64 decode or JSON parse failed");
    err.code = "MALFORMED_HEADER";
    throw err;
  }

  // Security Hardening: Reject attacker-injected header parameters that attempt to supply key locations
  if (header && (header.jku !== undefined || header.x5u !== undefined || header.jwk !== undefined)) {
    const err = new Error("Header-injected key parameters (jku, x5u, jwk) are strictly forbidden");
    err.code = "INVALID_HEADER";
    throw err;
  }

  // 2. Strict Configuration Preflight: Expected Issuer is Mandatory
  if (!options.expectedIssuer || typeof options.expectedIssuer !== 'string' || options.expectedIssuer.trim().length === 0) {
    const err = new Error("Server configuration error: Expected Supabase issuer ('expectedIssuer') is mandatory and must be explicitly configured");
    err.code = "VERIFICATION_CONFIG_ERROR";
    throw err;
  }

  // 3. Determine and Enforce Explicit Algorithm Allowlist & Configuration Consistency
  const allowedAlgs = options.allowedAlgorithms;
  if (!allowedAlgs || !Array.isArray(allowedAlgs) || allowedAlgs.length === 0) {
    const err = new Error("Server configuration error: Allowed algorithms ('allowedAlgorithms') must be explicitly configured");
    err.code = "VERIFICATION_CONFIG_ERROR";
    throw err;
  }

  const SUPPORTED_ALGORITHMS = ['HS256', 'RS256', 'ES256'];
  for (const alg of allowedAlgs) {
    if (!SUPPORTED_ALGORITHMS.includes(alg)) {
      const err = new Error(`Server configuration error: Algorithm '${alg}' is not supported or permitted`);
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }
  }

  // Enforce configuration consistency: algorithm requires matching key source
  if (allowedAlgs.includes('HS256')) {
    if (!options.jwtSecret || typeof options.jwtSecret !== 'string' || options.jwtSecret.trim().length === 0) {
      const err = new Error("Server configuration error: SUPABASE_JWT_SECRET is missing or invalid for configured algorithm 'HS256'");
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }
  }

  const hasAsymmetricAlg = allowedAlgs.some(a => a === 'RS256' || a === 'ES256');
  if (hasAsymmetricAlg) {
    const hasJwksConfig = Boolean(options.jwksUrl || options.jwksKeys || options.jwksFetcher);
    if (!hasJwksConfig) {
      const err = new Error("Server configuration error: JWKS configuration (jwksUrl or jwksKeys) is missing for configured asymmetric algorithm(s)");
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }

    if (options.jwksUrl) {
      if (typeof options.jwksUrl !== 'string' || !options.jwksUrl.startsWith('https://')) {
        const err = new Error("Server configuration error: jwksUrl must be a secure 'https://' URL");
        err.code = "VERIFICATION_CONFIG_ERROR";
        throw err;
      }
      try {
        const jwksOrigin = new URL(options.jwksUrl).origin;
        const issuerOrigin = new URL(options.expectedIssuer).origin;
        if (jwksOrigin !== issuerOrigin) {
          const err = new Error(`Configuration mismatch: JWKS URL origin ('${jwksOrigin}') does not match expected issuer origin ('${issuerOrigin}')`);
          err.code = "VERIFICATION_CONFIG_ERROR";
          throw err;
        }
      } catch (urlErr) {
        if (urlErr.code === "VERIFICATION_CONFIG_ERROR") throw urlErr;
        const err = new Error("Server configuration error: Malformed expectedIssuer or jwksUrl URL format");
        err.code = "VERIFICATION_CONFIG_ERROR";
        throw err;
      }
    }
  }

  // Hard safety invariant: Algorithm 'none' is NEVER allowed under any circumstances
  if (header.alg === 'none' || !header.alg) {
    const err = new Error("Algorithm 'none' or missing algorithm is strictly rejected");
    err.code = "INVALID_ALGORITHM";
    throw err;
  }

  if (!allowedAlgs.includes(header.alg)) {
    const err = new Error(`Unsupported or unapproved JWT algorithm: '${header.alg}'`);
    err.code = "INVALID_ALGORITHM";
    throw err;
  }

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = base64UrlToBytes(signatureB64);

  // 4. Cryptographic Signature Verification
  if (header.alg === 'HS256') {
    const secret = options.jwtSecret;
    if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
      const err = new Error("Server configuration error: SUPABASE_JWT_SECRET is missing or invalid for HS256");
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }

    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBytes,
      signedData
    );

    if (!isValid) {
      const err = new Error("Cryptographic JWT signature verification failed");
      err.code = "INVALID_SIGNATURE";
      throw err;
    }

  } else if (header.alg === 'RS256' || header.alg === 'ES256') {
    const hasJwksConfig = Boolean(options.jwksUrl || options.jwksKeys || options.jwksFetcher);
    if (!hasJwksConfig) {
      const err = new Error(`Server configuration error: JWKS configuration is missing for '${header.alg}'`);
      err.code = "VERIFICATION_CONFIG_ERROR";
      throw err;
    }

    const cryptoKey = await resolveAsymmetricKey(header.kid, header.alg, options);

    let isValid = false;
    if (header.alg === 'RS256') {
      isValid = await crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        signatureBytes,
        signedData
      );
    } else if (header.alg === 'ES256') {
      isValid = await crypto.subtle.verify(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        cryptoKey,
        signatureBytes,
        signedData
      );
    }

    if (!isValid) {
      const err = new Error("Cryptographic asymmetric JWT signature verification failed");
      err.code = "INVALID_SIGNATURE";
      throw err;
    }

  } else {
    const err = new Error(`Algorithm '${header.alg}' verification is not supported`);
    err.code = "UNSUPPORTED_ALGORITHM";
    throw err;
  }

  // 4. Decode Payload (Only trusted AFTER signature validation)
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    const err = new Error("Malformed JWT payload: Base64 decode or JSON parse failed");
    err.code = "MALFORMED_PAYLOAD";
    throw err;
  }

  // 5. Strict Claims Validation
  const now = Math.floor(Date.now() / 1000);
  const skew = typeof options.clockSkewSeconds === 'number' ? options.clockSkewSeconds : 30;

  // 5.1 Expiration Check (exp) - Required
  if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
    const err = new Error("Missing or invalid 'exp' claim in JWT payload");
    err.code = "MISSING_EXPIRY";
    throw err;
  }

  if (now > payload.exp + skew) {
    const err = new Error(`JWT token has expired at ${payload.exp} (current time: ${now})`);
    err.code = "TOKEN_EXPIRED";
    throw err;
  }

  // 5.2 Not-Before Check (nbf) - Optional, validated when present
  if (payload.nbf !== undefined && payload.nbf !== null) {
    if (typeof payload.nbf !== 'number' || !Number.isFinite(payload.nbf)) {
      const err = new Error("Invalid 'nbf' claim in JWT payload: Expected timestamp number");
      err.code = "INVALID_NBF";
      throw err;
    }
    if (now < payload.nbf - skew) {
      const err = new Error(`JWT token is not active yet (nbf: ${payload.nbf}, current time: ${now})`);
      err.code = "TOKEN_NOT_YET_VALID";
      throw err;
    }
  }

  // 5.3 Audience Check (aud) - Required
  const expectedAud = options.expectedAudience !== undefined ? options.expectedAudience : 'authenticated';
  if (!payload.aud) {
    const err = new Error("Missing required 'aud' claim in JWT payload");
    err.code = "MISSING_AUDIENCE";
    throw err;
  }
  if (expectedAud) {
    const audMatches = Array.isArray(payload.aud)
      ? payload.aud.includes(expectedAud)
      : payload.aud === expectedAud;

    if (!audMatches) {
      const err = new Error(`Invalid audience claim: expected '${expectedAud}'`);
      err.code = "INVALID_AUDIENCE";
      throw err;
    }
  }

  // 5.4 Issuer Check (iss) - Required & Checked against mandatory expectedIssuer
  if (!payload.iss || typeof payload.iss !== 'string' || payload.iss.trim().length === 0) {
    const err = new Error("Missing required 'iss' claim in JWT payload");
    err.code = "MISSING_ISSUER";
    throw err;
  }

  const normalizedExpected = options.expectedIssuer.trim().replace(/\/+$/, '');
  const normalizedActual = payload.iss.trim().replace(/\/+$/, '');
  if (normalizedActual !== normalizedExpected) {
    const err = new Error(`Invalid issuer claim: expected '${options.expectedIssuer}', found '${payload.iss}'`);
    err.code = "INVALID_ISSUER";
    throw err;
  }

  // 5.5 Subject Check (sub) - Required, RFC 4122 UUID
  if (!payload.sub || typeof payload.sub !== 'string') {
    const err = new Error("Missing required 'sub' claim in JWT payload");
    err.code = "MISSING_SUBJECT";
    throw err;
  }

  if (!UUID_REGEX.test(payload.sub.trim())) {
    const err = new Error("Invalid 'sub' claim: Must be a valid RFC 4122 UUID");
    err.code = "INVALID_SUBJECT";
    throw err;
  }

  return payload;
}

/**
 * Test helper: Generates an asymmetric RSA-2048 keypair for synthetic testing.
 * @param {string} [kid='test-rsa-key-1'] 
 * @returns {Promise<{ privateKey: CryptoKey, publicKey: CryptoKey, publicJwk: object }>}
 */
export async function createSyntheticRsaKeyPair(kid = 'test-rsa-key-1') {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  publicJwk.kid = kid;
  publicJwk.alg = "RS256";
  publicJwk.use = "sig";

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicJwk,
  };
}

/**
 * Test helper: Generates an asymmetric EC P-256 keypair for synthetic testing.
 * @param {string} [kid='test-ec-key-1'] 
 * @returns {Promise<{ privateKey: CryptoKey, publicKey: CryptoKey, publicJwk: object }>}
 */
export async function createSyntheticEcKeyPair(kid = 'test-ec-key-1') {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  publicJwk.kid = kid;
  publicJwk.alg = "ES256";
  publicJwk.use = "sig";

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicJwk,
  };
}

/**
 * Test helper: Generates a signed synthetic JWT (HS256, RS256, or ES256) for integration testing.
 *
 * @param {object} payload - Token claims (sub, aud, exp, iss, etc.).
 * @param {string|CryptoKey} secretOrPrivateKey - Signing secret (string for HS256, CryptoKey for RS256/ES256).
 * @param {object} [options]
 * @param {string} [options.alg='HS256']
 * @param {string} [options.kid]
 * @param {boolean} [options.tamperSignature=false]
 * @param {boolean} [options.tamperPayload=false]
 * @returns {Promise<string>}
 */
export async function createSyntheticJwt(payload, secretOrPrivateKey, options = {}) {
  const alg = options.alg || 'HS256';
  const header = { alg, typ: 'JWT' };
  if (options.kid) {
    header.kid = options.kid;
  }
  if (options.jku) {
    header.jku = options.jku;
  }
  if (options.x5u) {
    header.x5u = options.x5u;
  }
  if (options.jwk) {
    header.jwk = options.jwk;
  }

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const fullPayload = {
    iss: 'https://test-project.supabase.co/auth/v1',
    aud: 'authenticated',
    ...payload,
  };
  if (payload && 'iss' in payload && payload.iss === undefined) {
    delete fullPayload.iss;
  }
  if (payload && 'aud' in payload && payload.aud === undefined) {
    delete fullPayload.aud;
  }
  if (payload && 'sub' in payload && payload.sub === undefined) {
    delete fullPayload.sub;
  }
  if (payload && 'exp' in payload && payload.exp === undefined) {
    delete fullPayload.exp;
  }

  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signedData = `${headerB64}.${payloadB64}`;

  if (alg === 'none') {
    return `${signedData}.`;
  }

  let signatureBuffer;
  if (alg === 'HS256') {
    const enc = new TextEncoder();
    const keyData = enc.encode(secretOrPrivateKey);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      enc.encode(signedData)
    );
  } else if (alg === 'RS256') {
    const privateKey = secretOrPrivateKey;
    signatureBuffer = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      new TextEncoder().encode(signedData)
    );
  } else if (alg === 'ES256') {
    const privateKey = secretOrPrivateKey;
    signatureBuffer = await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      privateKey,
      new TextEncoder().encode(signedData)
    );
  } else {
    throw new Error(`Synthetic JWT creator does not support algorithm '${alg}'`);
  }

  let signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));

  if (options.tamperSignature) {
    signatureB64 = signatureB64.slice(0, -4) + "XXXX";
  }

  if (options.tamperPayload) {
    const tamperedPayloadB64 = base64UrlEncode(JSON.stringify({ ...payload, sub: "00000000-0000-4000-a000-000000000000" }));
    return `${headerB64}.${tamperedPayloadB64}.${signatureB64}`;
  }

  return `${signedData}.${signatureB64}`;
}
