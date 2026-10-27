// lib/auth/projection.js
/**
 * ShedBody — CF-4 Supabase Auth to Cloudflare D1 User Projection Utility
 *
 * Architectural Invariant:
 * Supabase Auth remains the single authoritative Identity Provider (IdP).
 * The D1 "user" table acts strictly as a downstream relational projection to satisfy
 * foreign-key constraints (REFERENCES "user"("id") ON DELETE CASCADE) across all
 * 11 user-owned domain tables in Cloudflare D1.
 *
 * Rules:
 * 1. Accepts ONLY verified Supabase user objects from trusted server-side execution.
 * 2. Never trusts unauthenticated or client-supplied IDs/emails.
 * 3. Maps Supabase UUID directly to D1 "user"."id".
 * 4. Documented timestamp unit: UNIX EPOCH SECONDS (integer), matching strftime('%s', 'now')
 *    in D1 migrations and existing repository defaults.
 * 5. Parameterized idempotent upserts; never updates existing user ID on email conflict.
 * 6. Never creates synthetic identities, passwords, sessions, or Better Auth accounts.
 * 7. Never deletes user rows as part of routine sync or user banning.
 * 8. Fails closed with explicit error reporting.
 */

export const TIMESTAMP_UNIT = 'seconds';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates whether a string is a standard RFC 4122 UUID.
 * @param {any} id 
 * @returns {boolean}
 */
export function isValidUuid(id) {
  if (typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Parses and normalizes a timestamp into Unix epoch seconds.
 * Consistent with SQLite's strftime('%s', 'now') used across all D1 domain tables.
 *
 * @param {string|number} val 
 * @param {string} fieldName 
 * @returns {number} Unix epoch seconds (integer)
 */
export function parseTimestampToSeconds(val, fieldName = 'timestamp') {
  if (val === undefined || val === null) {
    throw new Error(`PROJECTION_ERROR: Missing required timestamp field '${fieldName}'`);
  }

  if (typeof val === 'number') {
    if (!Number.isFinite(val) || val <= 0) {
      throw new Error(`PROJECTION_ERROR: Invalid ${fieldName} timestamp: must be positive number`);
    }
    // If value exceeds 1e11, it is in milliseconds (e.g. 1768478400000); convert to seconds
    return val > 1e11 ? Math.floor(val / 1000) : Math.floor(val);
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) {
      throw new Error(`PROJECTION_ERROR: Missing required timestamp string '${fieldName}'`);
    }
    // Numeric string check
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      return num > 1e11 ? Math.floor(num / 1000) : Math.floor(num);
    }
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new Error(`PROJECTION_ERROR: Invalid ${fieldName} timestamp: unable to parse ISO string '${val}'`);
    }
    return Math.floor(parsed / 1000);
  }

  throw new Error(`PROJECTION_ERROR: Invalid ${fieldName} timestamp type: expected string or number, got ${typeof val}`);
}

/**
 * Safely resolves the display name for the user.
 * Satisfies D1 "user"."name" NOT NULL without fabricating synthetic personal identity.
 *
 * @param {object} user 
 * @returns {string}
 */
export function resolveSafeName(user) {
  const metadata = user.user_metadata || user.raw_user_meta_data || {};
  const candidate = metadata.full_name || metadata.name || user.name;

  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }

  // Missing name: safely derive from verified email local-part or standard neutral fallback
  if (typeof user.email === 'string' && user.email.includes('@')) {
    const localPart = user.email.split('@')[0].trim();
    if (localPart.length > 0) {
      return localPart;
    }
  }

  return 'User';
}

/**
 * Validates and sanitizes a trusted Supabase user object into D1 projection attributes.
 *
 * @param {object} user - Verified user object from server-side Supabase Auth.
 * @param {object} [options]
 * @param {boolean} [options.allowSyntheticIds=false] - For synthetic migration rehearsal fixtures only.
 * @returns {object} Sanitized projection data
 */
export function validateAndMapSupabaseUser(user, options = {}) {
  if (!user || typeof user !== 'object') {
    throw new Error("PROJECTION_ERROR: Verified Supabase user object is required");
  }

  // 1. Validate User ID
  const allowSynthetic = options.allowSyntheticIds === true;
  if (!user.id || typeof user.id !== 'string') {
    throw new Error("PROJECTION_ERROR: Missing user ID");
  }

  const trimmedId = user.id.trim();
  if (!allowSynthetic && !isValidUuid(trimmedId)) {
    throw new Error(`PROJECTION_ERROR: User ID '${trimmedId}' is not a valid UUID`);
  }
  if (allowSynthetic && trimmedId.length === 0) {
    throw new Error("PROJECTION_ERROR: User ID cannot be empty");
  }

  // 2. Validate Email
  if (!user.email || typeof user.email !== 'string') {
    throw new Error("PROJECTION_ERROR: Missing user email");
  }
  const normalizedEmail = user.email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error(`PROJECTION_ERROR: Invalid user email format '${user.email}'`);
  }

  // 3. Resolve Display Name
  const safeName = resolveSafeName(user);

  // 4. Resolve Email Verification (0 or 1)
  let emailVerified = 0;
  if (user.emailVerified !== undefined && user.emailVerified !== null) {
    emailVerified = user.emailVerified ? 1 : 0;
  } else if (user.email_confirmed_at || user.confirmed_at) {
    emailVerified = 1;
  }

  // 5. Resolve Avatar Image (nullable)
  const metadata = user.user_metadata || user.raw_user_meta_data || {};
  const imageCandidate = metadata.avatar_url || metadata.picture || metadata.avatar || user.image;
  const safeImage = (typeof imageCandidate === 'string' && imageCandidate.trim().length > 0)
    ? imageCandidate.trim()
    : null;

  // 6. Resolve Timestamps (in Unix epoch seconds)
  const rawCreatedAt = user.created_at || user.createdAt;
  let createdAt;
  if (rawCreatedAt !== undefined && rawCreatedAt !== null) {
    createdAt = parseTimestampToSeconds(rawCreatedAt, 'createdAt');
  } else if (allowSynthetic || options.defaultMissingTimestamps === true) {
    createdAt = Math.floor(Date.now() / 1000);
  } else {
    throw new Error("PROJECTION_ERROR: Missing required timestamp field 'createdAt'");
  }

  const rawUpdatedAt = user.updated_at || user.updatedAt;
  let updatedAt;
  if (rawUpdatedAt !== undefined && rawUpdatedAt !== null) {
    updatedAt = parseTimestampToSeconds(rawUpdatedAt, 'updatedAt');
  } else {
    updatedAt = createdAt;
  }

  return {
    id: trimmedId,
    name: safeName,
    email: normalizedEmail,
    emailVerified,
    image: safeImage,
    createdAt,
    updatedAt
  };
}

/**
 * Checks whether an error is a SQLite foreign key constraint violation.
 * @param {any} err 
 * @returns {boolean}
 */
export function isForeignKeyError(err) {
  if (!err) return false;
  const msg = err.message || String(err);
  const code = err.code || err.cause?.code || '';
  const causeMsg = err.cause?.message || String(err.cause || '');
  return msg.includes('FOREIGN KEY') || 
         msg.includes('SQLITE_CONSTRAINT_FOREIGNKEY') || 
         causeMsg.includes('FOREIGN KEY') || 
         causeMsg.includes('SQLITE_CONSTRAINT_FOREIGNKEY') || 
         code === 'SQLITE_CONSTRAINT_FOREIGNKEY';
}

// -----------------------------------------------------------------------------
// Database Query Execution Abstraction
// Supports D1Adapter, raw Cloudflare D1 (env.DB / mockD1), and better-sqlite3.
// -----------------------------------------------------------------------------

async function executeQueryOne(db, sql, params = []) {
  if (!db) throw new Error("PROJECTION_ERROR: Database instance is required");

  // D1Adapter interface
  if (typeof db.queryOne === 'function') {
    return await db.queryOne(sql, params);
  }

  // Cloudflare D1 / mockD1 interface
  if (typeof db.prepare === 'function') {
    const stmt = db.prepare(sql);
    if (typeof stmt.bind === 'function') {
      const bound = stmt.bind(...params);
      if (typeof bound.first === 'function') return await bound.first();
      if (typeof bound.get === 'function') return await bound.get();
    }
    // better-sqlite3 interface
    if (typeof stmt.get === 'function') {
      return stmt.get(...params);
    }
  }

  throw new Error("PROJECTION_ERROR: Unsupported database interface for queryOne");
}

function executeQueryOneSync(db, sql, params = []) {
  if (!db) throw new Error("PROJECTION_ERROR: Database instance is required");
  if (typeof db.prepare === 'function') {
    const stmt = db.prepare(sql);
    if (typeof stmt.get === 'function') {
      return stmt.get(...params);
    }
  }
  throw new Error("PROJECTION_ERROR: Synchronous queryOne requires better-sqlite3 database");
}

async function executeRun(db, sql, params = []) {
  if (!db) throw new Error("PROJECTION_ERROR: Database instance is required");

  // D1Adapter interface
  if (typeof db.execute === 'function') {
    return await db.execute(sql, params);
  }

  // Cloudflare D1 / mockD1 interface
  if (typeof db.prepare === 'function') {
    const stmt = db.prepare(sql);
    if (typeof stmt.bind === 'function') {
      const bound = stmt.bind(...params);
      if (typeof bound.run === 'function') return await bound.run();
    }
    // better-sqlite3 interface
    if (typeof stmt.run === 'function') {
      return stmt.run(...params);
    }
  }

  throw new Error("PROJECTION_ERROR: Unsupported database interface for execute");
}

function executeRunSync(db, sql, params = []) {
  if (!db) throw new Error("PROJECTION_ERROR: Database instance is required");
  if (typeof db.prepare === 'function') {
    const stmt = db.prepare(sql);
    if (typeof stmt.run === 'function') {
      return stmt.run(...params);
    }
  }
  throw new Error("PROJECTION_ERROR: Synchronous execute requires better-sqlite3 database");
}

// -----------------------------------------------------------------------------
// Projection & JIT Guard Methods
// -----------------------------------------------------------------------------

/**
 * Checks whether a user ID exists in the D1 "user" table.
 *
 * @param {object} db 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function checkUserExistsInD1(db, userId) {
  if (!userId || typeof userId !== 'string') return false;
  const row = await executeQueryOne(
    db,
    'SELECT 1 AS exists_flag FROM "user" WHERE id = ? LIMIT 1',
    [userId.trim()]
  );
  return Boolean(row);
}

/**
 * Checks whether a user ID exists in D1 synchronously (better-sqlite3 only).
 *
 * @param {object} db 
 * @param {string} userId 
 * @returns {boolean}
 */
export function checkUserExistsInD1Sync(db, userId) {
  if (!userId || typeof userId !== 'string') return false;
  const row = executeQueryOneSync(
    db,
    'SELECT 1 AS exists_flag FROM "user" WHERE id = ? LIMIT 1',
    [userId.trim()]
  );
  return Boolean(row);
}

const UPSERT_USER_SQL = `
  INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT("id") DO UPDATE SET
    "name" = excluded."name",
    "email" = excluded."email",
    "emailVerified" = excluded."emailVerified",
    "image" = COALESCE(excluded."image", "user"."image"),
    "updatedAt" = excluded."updatedAt"
`;

/**
 * Idempotently projects a verified Supabase user into the D1 "user" table.
 * Parameterized and defensive: refuses to modify an existing user's ID on email conflict.
 *
 * @param {object} db - D1 instance or adapter
 * @param {object} user - Verified Supabase user
 * @param {object} [options]
 * @returns {Promise<{ success: boolean, user: object }>}
 */
export async function projectUserToD1(db, user, options = {}) {
  const sanitized = validateAndMapSupabaseUser(user, options);

  // Guard against email conflict with a different user ID
  const existingByEmail = await executeQueryOne(
    db,
    'SELECT id FROM "user" WHERE email = ? LIMIT 1',
    [sanitized.email]
  );

  if (existingByEmail && existingByEmail.id !== sanitized.id) {
    throw new Error(
      `PROJECTION_CONFLICT: Email '${sanitized.email}' is already associated with existing user '${existingByEmail.id}'; cannot overwrite with '${sanitized.id}'`
    );
  }

  const params = [
    sanitized.id,
    sanitized.name,
    sanitized.email,
    sanitized.emailVerified,
    sanitized.image,
    sanitized.createdAt,
    sanitized.updatedAt,
  ];

  await executeRun(db, UPSERT_USER_SQL, params);

  return { success: true, user: sanitized };
}

/**
 * Synchronous version of projectUserToD1 (for better-sqlite3 rehearsal scripts).
 *
 * @param {object} db - better-sqlite3 database instance
 * @param {object} user - Verified Supabase user
 * @param {object} [options]
 * @returns {{ success: boolean, user: object }}
 */
export function projectUserToD1Sync(db, user, options = {}) {
  const sanitized = validateAndMapSupabaseUser(user, options);

  // Guard against email conflict with a different user ID
  const existingByEmail = executeQueryOneSync(
    db,
    'SELECT id FROM "user" WHERE email = ? LIMIT 1',
    [sanitized.email]
  );

  if (existingByEmail && existingByEmail.id !== sanitized.id) {
    throw new Error(
      `PROJECTION_CONFLICT: Email '${sanitized.email}' is already associated with existing user '${existingByEmail.id}'; cannot overwrite with '${sanitized.id}'`
    );
  }

  const params = [
    sanitized.id,
    sanitized.name,
    sanitized.email,
    sanitized.emailVerified,
    sanitized.image,
    sanitized.createdAt,
    sanitized.updatedAt,
  ];

  executeRunSync(db, UPSERT_USER_SQL, params);

  return { success: true, user: sanitized };
}

/**
 * JIT (Just-In-Time) User Projection Guard.
 * Wraps a mutation function to safely recover from missing user projections.
 *
 * Invariants:
 * 1. Checks whether the exact verified user's parent row is missing in "user".
 * 2. Only attempts projection if the user row is missing.
 * 3. Never retries for unrelated foreign-key errors (missing plan, goal, habit, etc.).
 * 4. Retries the original mutation at most once.
 * 5. Preserves the original error if recovery fails.
 *
 * @param {object} db 
 * @param {object} verifiedUser 
 * @param {Function} mutationFn 
 * @param {object} [options] 
 * @returns {Promise<any>}
 */
export async function withUserProjectionGuard(db, verifiedUser, mutationFn, options = {}) {
  if (!verifiedUser || typeof verifiedUser !== 'object' || !verifiedUser.id) {
    throw new Error("PROJECTION_ERROR: Verified Supabase user is required for JIT guard");
  }

  try {
    return await mutationFn();
  } catch (originalError) {
    if (!isForeignKeyError(originalError)) {
      throw originalError;
    }

    // Step 1: Verify whether the exact verified user is missing
    const userExists = await checkUserExistsInD1(db, verifiedUser.id);
    if (userExists) {
      // The user already exists in D1. The FK violation is for an unrelated entity
      // (e.g. invalid plan_id, goal_id, habit_id). Never retry or create users.
      throw originalError;
    }

    // Step 2: Parent user row is missing. Attempt idempotent projection.
    try {
      await projectUserToD1(db, verifiedUser, options);
    } catch (projectionError) {
      // If projection itself fails, preserve and rethrow the original mutation error
      throw originalError;
    }

    // Step 3: Retry original mutation exactly once
    return await mutationFn();
  }
}

/**
 * Synchronous version of withUserProjectionGuard (for better-sqlite3 test harnesses).
 *
 * @param {object} db 
 * @param {object} verifiedUser 
 * @param {Function} mutationFn 
 * @param {object} [options] 
 * @returns {any}
 */
export function withUserProjectionGuardSync(db, verifiedUser, mutationFn, options = {}) {
  if (!verifiedUser || typeof verifiedUser !== 'object' || !verifiedUser.id) {
    throw new Error("PROJECTION_ERROR: Verified Supabase user is required for JIT guard");
  }

  try {
    return mutationFn();
  } catch (originalError) {
    if (!isForeignKeyError(originalError)) {
      throw originalError;
    }

    // Step 1: Verify whether the exact verified user is missing
    const userExists = checkUserExistsInD1Sync(db, verifiedUser.id);
    if (userExists) {
      // User exists; unrelated FK failure. Fail closed immediately.
      throw originalError;
    }

    // Step 2: Parent user row is missing. Attempt idempotent projection.
    try {
      projectUserToD1Sync(db, verifiedUser, options);
    } catch (projectionError) {
      throw originalError;
    }

    // Step 3: Retry original mutation exactly once
    return mutationFn();
  }
}
