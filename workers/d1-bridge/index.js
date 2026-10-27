// workers/d1-bridge/index.js
/**
 * ShedBody — Cloudflare Worker D1 Bridge Gateway
 *
 * Implements a dedicated, authenticated Cloudflare Worker runtime bridge for
 * executing D1 operations natively with `env.DB`.
 *
 * Architecture Invariants:
 * 1. Supabase Auth remains the sole identity authority. Identity is verified via
 *    cryptographic JWT inspection against SUPABASE_JWT_SECRET using Web Crypto.
 * 2. Strict tenant isolation: Verified user ID is derived solely from the validated
 *    token claims (`sub`). Any caller-supplied mismatched user ID is strictly rejected (403).
 * 3. Native Cloudflare D1 binding via `env.DB`. Never assumes `process.env.DB`.
 * 4. Default-off feature flag enforcement: Requires `env.ENABLE_D1_BRIDGE === "true"`.
 * 5. Fail-closed write semantics: Never falls back to Supabase. Never silently swallows errors.
 * 6. Safe bounded error responses: No raw SQL, database errors, secrets, or tokens in outputs or logs.
 */

import { D1Adapter } from '../../lib/repositories/D1Adapter.js';
import { GoalRepository } from '../../lib/repositories/GoalRepository.js';
import { verifySupabaseJwt, safeTimingCompare } from '../../lib/auth/edgeJwtVerifier.js';
import { withUserProjectionGuard } from '../../lib/auth/projection.js';
import { logger, pseudonymizeId } from '../../lib/observability/logger.js';

function jsonResponse(status, data, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function safeErrorDetails(error, operation, userId = null) {
  const code = error?.code || 'DATABASE_ERROR';
  const details = {
    operation,
    code: typeof code === 'string' && code.length < 50 ? code : 'DATABASE_ERROR',
  };
  if (userId) {
    const userRef = pseudonymizeId(userId);
    if (userRef) details.userRef = userRef;
  }
  return details;
}

/**
 * Main request router for the Cloudflare D1 Bridge Worker.
 *
 * @param {Request} request 
 * @param {object} env 
 * @param {object} [ctx] 
 * @returns {Promise<Response>}
 */
export async function handleBridgeRequest(request, env = {}, ctx = null) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 1. Strict Opt-in Feature Flag Guard
  if (env.ENABLE_D1_BRIDGE !== "true") {
    return jsonResponse(503, {
      success: false,
      error: "D1_BRIDGE_DISABLED",
      message: "Cloudflare D1 Bridge service is disabled",
    });
  }

  // 2. Health Check (Can execute before D1 binding if purely checking worker responsiveness)
  if (path === '/health' || path === '/api/bridge/health') {
    return jsonResponse(200, {
      status: "healthy",
      service: "d1-bridge",
      runtime: "cloudflare-worker",
      hasBinding: Boolean(env.DB),
      timestamp: Math.floor(Date.now() / 1000),
    });
  }

  // 3. Native Cloudflare D1 Binding Verification
  if (!env.DB || typeof env.DB.prepare !== 'function') {
    logger.error("D1_BRIDGE_BINDING_MISSING", {
      details: {
        operation: 'binding_check',
        code: 'D1_BINDING_MISSING',
      },
    });
    return jsonResponse(500, {
      success: false,
      error: "D1_BINDING_MISSING",
      message: "D1 database binding (env.DB) is missing. Ensure binding is configured in Cloudflare environment.",
    });
  }

  // 4. Internal Service Authentication Guard (Defense-in-depth between Vercel and Cloudflare)
  const requireInternalSecret = env.REQUIRE_INTERNAL_SECRET === "true";
  if (requireInternalSecret && (!env.INTERNAL_BRIDGE_SECRET || env.INTERNAL_BRIDGE_SECRET.trim().length === 0)) {
    logger.error("D1_BRIDGE_CONFIG_ERROR", {
      details: {
        operation: 'config_check',
        code: 'MISSING_REQUIRED_SERVICE_SECRET',
      },
    });
    return jsonResponse(500, {
      success: false,
      error: "CONFIGURATION_ERROR",
      message: "Internal bridge secret is required but not configured in environment",
    });
  }

  if (env.INTERNAL_BRIDGE_SECRET || requireInternalSecret) {
    const serviceSecret = request.headers.get('x-internal-secret');
    if (!serviceSecret || !safeTimingCompare(serviceSecret, env.INTERNAL_BRIDGE_SECRET)) {
      return jsonResponse(401, {
        success: false,
        error: "INVALID_SERVICE_SECRET",
        message: "Internal service secret missing or invalid",
      });
    }
  }

  // 5. Supabase Auth Verification (Bearer Token)
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse(401, {
      success: false,
      error: "UNAUTHORIZED",
      message: "Missing or malformed Authorization header. Expected 'Bearer <token>'.",
    });
  }

  const token = authHeader.slice(7).trim();
  let verifiedClaims;
  try {
    const allowedAlgs = env.ALLOWED_JWT_ALGORITHMS
      ? env.ALLOWED_JWT_ALGORITHMS.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const expectedIssuer = env.SUPABASE_AUTH_ISSUER || (env.SUPABASE_URL ? `${env.SUPABASE_URL.replace(/\/+$/, '')}/auth/v1` : undefined);
    const jwksUrl = env.SUPABASE_JWKS_URL || (env.SUPABASE_URL ? `${env.SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/.well-known/jwks.json` : undefined);

    verifiedClaims = await verifySupabaseJwt(token, {
      jwtSecret: env.SUPABASE_JWT_SECRET,
      jwksUrl,
      jwksKeys: env.SUPABASE_JWKS_KEYS,
      jwksFetcher: env.SUPABASE_JWKS_FETCHER,
      allowedAlgorithms: allowedAlgs,
      expectedAudience: 'authenticated',
      expectedIssuer,
    });
  } catch (authError) {
    logger.warn("D1_BRIDGE_AUTH_REJECTED", {
      details: {
        operation: 'jwt_verify',
        code: authError?.code || 'AUTH_REJECTED',
      },
    });

    if (authError?.code === 'VERIFICATION_CONFIG_ERROR') {
      return jsonResponse(500, {
        success: false,
        error: "VERIFICATION_CONFIG_ERROR",
        message: "Authentication verifier is misconfigured",
      });
    }

    return jsonResponse(401, {
      success: false,
      error: "UNAUTHORIZED",
      message: "Invalid or expired authentication credentials",
    });
  }

  const verifiedUserId = verifiedClaims.sub;

  // 6. Tenant Isolation Guard: Verify caller-supplied user IDs cannot spoof another tenant
  let requestBody = null;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      requestBody = await request.json();
    } catch {
      return jsonResponse(400, {
        success: false,
        error: "INVALID_JSON",
        message: "Request body must be valid JSON",
      });
    }

    if (requestBody && typeof requestBody === 'object') {
      const claimedId = requestBody.userId || requestBody.user_id;
      if (claimedId && claimedId !== verifiedUserId) {
        logger.error("D1_BRIDGE_CROSS_TENANT_BLOCKED", {
          details: {
            operation: 'tenant_guard',
            code: 'CROSS_TENANT_FORBIDDEN',
            userRef: pseudonymizeId(verifiedUserId),
          },
        });
        return jsonResponse(403, {
          success: false,
          error: "FORBIDDEN",
          message: "Unauthorized: Cross-tenant access is prohibited.",
        });
      }
    }
  }

  const claimedQueryId = url.searchParams.get('userId') || url.searchParams.get('user_id');
  if (claimedQueryId && claimedQueryId !== verifiedUserId) {
    logger.error("D1_BRIDGE_CROSS_TENANT_QUERY_BLOCKED", {
      details: {
        operation: 'tenant_guard',
        code: 'CROSS_TENANT_FORBIDDEN',
        userRef: pseudonymizeId(verifiedUserId),
      },
    });
    return jsonResponse(403, {
      success: false,
      error: "FORBIDDEN",
      message: "Unauthorized: Cross-tenant access is prohibited.",
    });
  }

  // 7. Route Execution Boundary
  try {
    const adapter = new D1Adapter(env.DB);

    // ROUTE: POST /api/bridge/goals
    if (method === 'POST' && path === '/api/bridge/goals') {
      const targetValue = Number(requestBody?.targetValue);
      if (!Number.isFinite(targetValue) || targetValue <= 0) {
        return jsonResponse(400, {
          success: false,
          error: "VALIDATION_ERROR",
          message: "targetValue must be a positive number",
        });
      }

      const goalRepo = new GoalRepository(adapter);
      const verifiedUser = {
        id: verifiedUserId,
        email: verifiedClaims.email || `${verifiedUserId}@shedbody.internal`,
        user_metadata: verifiedClaims.user_metadata || {},
        created_at: verifiedClaims.created_at || Math.floor(Date.now() / 1000),
      };

      const createdGoal = await withUserProjectionGuard(env.DB, verifiedUser, async () => {
        return await goalRepo.createWeightGoal(verifiedUserId, targetValue);
      });

      return jsonResponse(201, {
        success: true,
        data: createdGoal,
      });
    }

    // ROUTE: GET /api/bridge/goals/active
    if (method === 'GET' && path === '/api/bridge/goals/active') {
      const domain = url.searchParams.get('domain') || 'weight';
      const goalRepo = new GoalRepository(adapter);
      const activeGoal = await goalRepo.getActiveGoal(verifiedUserId, domain);

      return jsonResponse(200, {
        success: true,
        data: activeGoal || null,
      });
    }

    // Unmatched Route
    return jsonResponse(404, {
      success: false,
      error: "ROUTE_NOT_FOUND",
      message: `Endpoint '${method} ${path}' was not found on D1 Bridge`,
    });

  } catch (error) {
    // 8. Bounded, Sanitized Fail-Closed Error Response
    logger.error("D1_BRIDGE_OPERATION_FAILED", safeErrorDetails(error, path, verifiedUserId));

    const cause = error?.cause;
    const errCode = error?.code || cause?.code || '';
    const errName = error?.name || cause?.name || '';
    const errMsg = `${error?.message || ''} ${cause?.message || ''}`;

    // Database Constraint Violation
    if (
      errCode.includes('SQLITE_CONSTRAINT') ||
      errMsg.includes('UNIQUE constraint failed') ||
      errMsg.includes('CHECK constraint failed') ||
      errMsg.includes('FOREIGN KEY constraint failed')
    ) {
      return jsonResponse(409, {
        success: false,
        error: "CONSTRAINT_VIOLATION",
        message: "Database constraint violation occurred",
      });
    }

    // Timeout or Aborted Operation (Ambiguous write outcome)
    if (
      errName === 'AbortError' ||
      errCode === 'TIMEOUT' ||
      errMsg.toLowerCase().includes('timeout') ||
      errMsg.toLowerCase().includes('aborted')
    ) {
      return jsonResponse(504, {
        success: false,
        error: "D1_WRITE_TIMEOUT_UNKNOWN_OUTCOME",
        message: "Database operation timed out. Mutation outcome is ambiguous; do not retry automatically.",
      });
    }

    // Missing Binding
    if (errCode === 'D1_BINDING_MISSING') {
      return jsonResponse(500, {
        success: false,
        error: "D1_BINDING_MISSING",
        message: "Database binding missing",
      });
    }

    // Generic Internal Error: Never expose internal stack trace, SQL queries, or table structure
    return jsonResponse(500, {
      success: false,
      error: "INTERNAL_ERROR",
      message: "An internal database error occurred while processing the request",
    });
  }
}

export default {
  fetch(request, env, ctx) {
    return handleBridgeRequest(request, env, ctx);
  },
};
