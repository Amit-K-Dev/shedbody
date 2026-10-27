/**
 * lib/auth/sessionValidator.js
 *
 * Lightweight, zero-native-dependency Better Auth Session Validator for Next.js and Cloudflare Workers.
 *
 * Capabilities:
 * 1. Parses session cookies (__Secure-better-auth.session_token or better-auth.session_token).
 * 2. Directly validates sessions against Cloudflare D1 with relational user retrieval.
 * 3. Enforces session expiration without network hops.
 * 4. Supports session revocation (sign-out) at the D1 database level.
 * 5. Defensive and fail-closed: returns null on missing, malformed, or expired sessions.
 *
 * RUNTIME REQUIREMENT:
 * Direct D1 validation (`validateD1Session`, `revokeD1Session`) requires a native
 * Cloudflare D1 database binding (`env.DB`). In standard Vercel Node runtimes where
 * no D1 binding is present, use `resolveServerSession()` from `lib/auth/sessionResolver.js`.
 */

/**
 * Known Better Auth session cookie names in order of preference.
 */
export const BETTER_AUTH_COOKIE_NAMES = [
  '__Secure-better-auth.session_token',
  'better-auth.session_token',
];

/**
 * Extracts the raw Better Auth session token from either a cookie header string
 * or a Next.js / Web Request cookie store.
 *
 * @param {string|object} cookies - Cookie header string or object with `.get(name)`
 * @returns {string|null} Extracted session token or null if not present
 */
export function extractSessionToken(cookies) {
  if (!cookies) return null;

  // Case 1: Next.js cookies() / Request.cookies object with .get() method
  if (typeof cookies === 'object' && typeof cookies.get === 'function') {
    for (const name of BETTER_AUTH_COOKIE_NAMES) {
      const match = cookies.get(name);
      if (match) {
        const rawVal = typeof match === 'string' ? match : match.value;
        if (typeof rawVal === 'string' && rawVal.trim().length > 0) {
          const trimmed = rawVal.trim();
          try {
            return decodeURIComponent(trimmed);
          } catch {
            return trimmed;
          }
        }
      }
    }
    return null;
  }

  // Case 2: Plain cookie header string
  if (typeof cookies === 'string') {
    const pairs = cookies.split(';');
    for (const pair of pairs) {
      const [rawName, ...rawValParts] = pair.split('=');
      if (!rawName) continue;
      const trimmedName = rawName.trim();
      if (BETTER_AUTH_COOKIE_NAMES.includes(trimmedName)) {
        const val = rawValParts.join('=').trim();
        if (val.length > 0) {
          try {
            return decodeURIComponent(val);
          } catch {
            return val;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Normalizes a session token extracted from cookies.
 * If the cookie contains a Better Auth HMAC signature (format: <token>.<signature>),
 * extracts the raw session token before the dot for database lookup.
 *
 * @param {string} token - Raw or signed session token
 * @returns {string|null} Normalized session token for D1 lookup
 */
export function normalizeSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  return trimmed.includes('.') ? trimmed.split('.')[0] : trimmed;
}

/**
 * Checks whether an ISO date string or millisecond timestamp is in the past.
 *
 * @param {string|number|Date} expiresAt
 * @returns {boolean} True if expired
 */
export function isSessionExpired(expiresAt) {
  if (!expiresAt) return true;
  const expiryTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryTime)) return true;
  return expiryTime <= Date.now();
}

/**
 * Validates a session token directly against Cloudflare D1.
 * Returns the normalized session and user record if valid, or null if invalid/expired.
 *
 * @param {object} d1 - Cloudflare D1 binding (prepare/bind/first)
 * @param {string} token - Session token (raw or signed)
 * @returns {Promise<{ session: object, user: object }|null>}
 */
export async function validateD1Session(d1, token) {
  if (!d1 || typeof d1.prepare !== 'function' || !token || typeof token !== 'string') {
    return null;
  }

  const cleanToken = normalizeSessionToken(token);
  if (!cleanToken) return null;

  try {
    const query = `
      SELECT 
        s.id as session_id,
        s.expiresAt as session_expiresAt,
        s.token as session_token,
        s.createdAt as session_createdAt,
        s.updatedAt as session_updatedAt,
        s.ipAddress as session_ipAddress,
        s.userAgent as session_userAgent,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name,
        u.emailVerified as user_emailVerified,
        u.image as user_image,
        u.createdAt as user_createdAt,
        u.updatedAt as user_updatedAt
      FROM "session" s
      JOIN "user" u ON s.userId = u.id
      WHERE s.token = ?
      LIMIT 1;
    `;

    const row = await d1.prepare(query).bind(cleanToken).first();
    if (!row) {
      return null;
    }

    // Check expiration
    if (isSessionExpired(row.session_expiresAt)) {
      return null;
    }

    return {
      session: {
        id: row.session_id,
        userId: row.user_id,
        expiresAt: new Date(row.session_expiresAt),
        createdAt: new Date(row.session_createdAt),
        token: row.session_token,
        ipAddress: row.session_ipAddress || null,
        userAgent: row.session_userAgent || null,
      },
      user: {
        id: row.user_id,
        email: row.user_email,
        name: row.user_name || '',
        emailVerified: Boolean(row.user_emailVerified),
        image: row.user_image || null,
        createdAt: new Date(row.user_createdAt),
      },
    };
  } catch (err) {
    // Fail closed on database errors
    return null;
  }
}

/**
 * Revokes (deletes) a session from Cloudflare D1.
 *
 * @param {object} d1 - Cloudflare D1 binding
 * @param {string} token - Session token to revoke (raw or signed)
 * @returns {Promise<boolean>} True if revocation succeeded
 */
export async function revokeD1Session(d1, token) {
  if (!d1 || typeof d1.prepare !== 'function' || !token || typeof token !== 'string') {
    return false;
  }

  const cleanToken = normalizeSessionToken(token);
  if (!cleanToken) return false;

  try {
    const query = `DELETE FROM "session" WHERE token = ?;`;
    await d1.prepare(query).bind(cleanToken).run();
    return true;
  } catch {
    return false;
  }
}
