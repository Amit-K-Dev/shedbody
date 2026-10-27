// lib/observability/logger.js
/**
 * Lightweight, zero-dependency structured logger compatible with both
 * Cloudflare Workers (workerd) and Node.js/Next.js runtimes.
 *
 * Enforces:
 * - Deterministic JSON event output
 * - Automatic redaction of sensitive credentials, secrets, tokens, and headers
 * - Safe error classification without leaking internal paths or secrets
 * - Consistent outcome events for background jobs (started, skipped, completed, failed)
 * - Safe missing request/job ID behavior
 */

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'cron_secret',
  'cronsecret',
  'internal_api_secret',
  'internalapisecret',
  'password',
  'token',
  'secret',
  'api_key',
  'apikey',
  'credential',
  'credentials',
  'private_key',
  'privatekey',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'session_token',
  'database_url',
  'db_url',
  'connection_string',
  'email',
  'phone',
  'ssn'
]);

const SENSITIVE_VALUE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi,
  /(?:api[_-]?key|secret|token|password|cron[_-]?secret|cronsecret|internal[_-]?api[_-]?secret)[=:\s]+['"]?[A-Za-z0-9._~+/-]+['"]?/gi,
  /(?:cookie|set-cookie)[=:\s]+['"]?[^\r\n,'"]+['"]?/gi,
  /(?:authorization)[=:\s]+['"]?[^\r\n,'"]+['"]?/gi
];

/**
 * Generates a deterministic pseudonymous correlation identifier (e.g. anon_a1b2c3d4).
 * Uses standard FNV-1a (32-bit Fowler-Noll-Vo) hash.
 * 
 * CRITICAL PRIVACY & SECURITY LIMITATIONS:
 * - NOT Cryptographically Secure: FNV-1a is a non-cryptographic checksum algorithm.
 * - NOT Anonymous: With a 32-bit output space (~4.29 billion values), this hash can be
 *   brute-forced or rainbow-table searched against known user ID candidates (e.g. UUIDs, emails).
 * - SENSITIVE TELEMETRY: Any emitted 'userRef' must be treated as sensitive pseudonymous telemetry,
 *   never as anonymous or de-identified public data.
 * - OMISSION PREFERRED: When stable correlation across failures is unnecessary, user identifiers
 *   MUST be omitted completely rather than pseudonymized.
 * - OPERATIONAL USE ONLY: Serves solely for correlating recurring operational failures within
 *   ephemeral debug traces without introducing custom secret keys.
 */
export function pseudonymizeId(id) {
  if (id === null || id === undefined) return null;
  const str = String(id);
  if (!str) return null;

  // 32-bit FNV-1a hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `anon_${hex}`;
}

/**
 * Redacts known sensitive strings in text messages and error descriptions.
 * 
 * LIMITATION NOTE:
 * String-pattern regex matching is an auxiliary defense layer. It effectively sanitizes
 * known schemas, URI credentials, Bearer tokens, and key=value pairs. However, it cannot
 * guarantee redaction of high-entropy unstructured secrets embedded without delimiters.
 * Structured key-based object redaction remains the primary deterministic privacy boundary.
 */
export function redactString(str) {
  if (typeof str !== 'string') return str;
  let redacted = str;

  // 1. Redact URI passwords e.g. postgres://user:super_secret_pw@host:5432
  redacted = redacted.replace(/([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/:]+:)([^@]+)(@)/g, '$1[REDACTED]$3');

  // 2. Redact explicit user identifier assignments e.g. user_id=123e4567... or userId: test-user
  redacted = redacted.replace(/(?:user[_-]?id|userId)[=:\s]+['"]?([A-Za-z0-9_-]{4,})['"]?/gi, (match, id) => {
    return `userRef=${pseudonymizeId(id)}`;
  });

  // 3. Redact known sensitive value patterns
  for (const pattern of SENSITIVE_VALUE_PATTERNS) {
    redacted = redacted.replace(pattern, (match) => {
      const lower = match.toLowerCase();
      if (lower.startsWith('bearer ')) {
        return 'Bearer [REDACTED]';
      }
      return '[REDACTED]';
    });
  }

  return redacted;
}

/**
 * Deeply redacts sensitive keys and values from an object,
 * and automatically replaces any raw user identifiers with non-reversible pseudonyms.
 */
export function redactSensitiveData(data, depth = 0) {
  if (depth > 5) return '[MAX_DEPTH]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return redactString(data);
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Automatic user identifier pseudonymization: never emit raw user IDs
    if (lowerKey === 'user_id' || lowerKey === 'userid') {
      const pseud = pseudonymizeId(value);
      if (pseud !== null) {
        sanitized['userRef'] = pseud;
      }
    } else if (lowerKey === 'userref') {
      if (value === null || value === undefined) {
        // Explicitly omit when stable correlation is unnecessary
      } else if (typeof value === 'string' && value.startsWith('anon_')) {
        sanitized['userRef'] = value;
      } else {
        const pseud = pseudonymizeId(value);
        if (pseud !== null) {
          sanitized['userRef'] = pseud;
        }
      }
    } else if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value, depth + 1);
    } else if (typeof value === 'string') {
      sanitized[key] = redactString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Safely classifies and serializes errors without leaking internal stack frames or secrets.
 */
export function classifyError(err) {
  if (!err) return null;

  const rawMessage = typeof err === 'string' 
    ? err 
    : (typeof err.message === 'string' ? err.message : 'Unknown error');
  const sanitizedMessage = redactString(rawMessage);
  const name = (typeof err.name === 'string' && err.name) ? err.name : 'Error';
  const rawCode = err.code || err.statusCode || err.status || undefined;
  const code = rawCode !== undefined ? String(rawCode) : undefined;

  let category = 'INTERNAL_ERROR';
  let retryable = false;

  const lower = sanitizedMessage.toLowerCase();
  if (lower.includes('check constraint') || lower.includes('unique constraint')) {
    category = 'DATABASE_CONSTRAINT_ERROR';
    retryable = false;
  } else if (lower.includes('foreign key') || lower.includes('foreign_key')) {
    category = 'FOREIGN_KEY_VIOLATION';
    retryable = false;
  } else if (lower.includes('unauthorized') || code === '401' || code === '403') {
    category = 'AUTHENTICATION_ERROR';
    retryable = false;
  } else if (lower.includes('timeout') || lower.includes('econnreset') || lower.includes('network') || lower.includes('fetch failed')) {
    category = 'TRANSIENT_NETWORK_ERROR';
    retryable = true;
  } else if (lower.includes('d1') || lower.includes('sqlite')) {
    category = 'DATABASE_ERROR';
    retryable = true; // May be a transient SQLite busy/lock
  }

  return {
    name,
    message: sanitizedMessage,
    ...(code ? { code } : {}),
    category,
    retryable
  };
}

/**
 * Structured Logger class.
 */
export class StructuredLogger {
  constructor(options = {}) {
    this.context = options.context || {};
    this.sink = options.sink || null;
    this.enabled = options.enabled !== false;
  }

  /**
   * Creates a child logger with bound context (e.g. requestId, jobId, service).
   */
  withContext(context = {}) {
    return new StructuredLogger({
      context: { ...this.context, ...context },
      sink: this.sink,
      enabled: this.enabled
    });
  }

  /**
   * Sets or overrides the output sink (useful for testing or custom transports).
   */
  setSink(sink) {
    this.sink = sink;
  }

  log(severity, event, payload = {}) {
    if (!this.enabled) return null;

    const {
      details,
      error,
      requestId = this.context.requestId,
      jobId = this.context.jobId,
      durationMs,
      ...rest
    } = payload;

    const entry = {
      timestamp: new Date().toISOString(),
      severity,
      event,
      ...(this.context.service ? { service: this.context.service } : {}),
      ...(this.context.runtime ? { runtime: this.context.runtime } : {}),
      ...(requestId ? { requestId: String(requestId) } : {}),
      ...(jobId ? { jobId: String(jobId) } : {}),
      ...(durationMs !== undefined ? { durationMs: Math.round(durationMs) } : {})
    };

    const mergedDetails = { ...rest, ...(details || {}) };
    if (Object.keys(mergedDetails).length > 0) {
      entry.details = redactSensitiveData(mergedDetails);
    }

    if (error) {
      entry.error = classifyError(error);
    }

    if (this.sink) {
      this.sink(entry);
    } else {
      const line = JSON.stringify(entry);
      if (severity === 'ERROR') {
        console.error(line);
      } else if (severity === 'WARN') {
        console.warn(line);
      } else {
        console.log(line);
      }
    }

    return entry;
  }

  info(event, payload) {
    return this.log('INFO', event, payload);
  }

  warn(event, payload) {
    return this.log('WARN', event, payload);
  }

  error(event, payload) {
    return this.log('ERROR', event, payload);
  }

  debug(event, payload) {
    return this.log('DEBUG', event, payload);
  }
}

// Global default instance
export const logger = new StructuredLogger({
  context: { service: 'shedbody' }
});
