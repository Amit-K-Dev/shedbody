import assert from 'node:assert';
import { safeTimingCompare } from '../lib/auth/edgeJwtVerifier.js';
import { PythonServiceClient } from '../lib/api/pythonClient.js';

console.log("=== Phase 1F Authentication Remediation Verification ===\n");

// 1. Test safeTimingCompare
console.log("1. Testing safeTimingCompare...");
assert.strictEqual(safeTimingCompare("secret123", "secret123"), true, "Identical strings must match");
assert.strictEqual(safeTimingCompare("secret123", "secret124"), false, "Different strings must not match");
assert.strictEqual(safeTimingCompare("secret123", "secret12"), false, "Different lengths must not match");
assert.strictEqual(safeTimingCompare("", ""), true, "Empty strings match");
assert.strictEqual(safeTimingCompare(null, "secret123"), false, "Null input rejected");
assert.strictEqual(safeTimingCompare(undefined, "secret123"), false, "Undefined input rejected");
assert.strictEqual(safeTimingCompare("internal-python-secret-key-123", "test-internal-secret"), false, "Legacy fallback rejected against valid secret");
console.log("✅ safeTimingCompare passed all assertions.");

// 2. Test fail-closed PythonServiceClient
console.log("\n2. Testing PythonServiceClient fail-closed behaviors...");
const unconfiguredClient = new PythonServiceClient({});
let threwMissingConfig = false;
try {
  await unconfiguredClient.fetchAnalytics("user-1", "weight-trend", "30d");
} catch (e) {
  threwMissingConfig = true;
  assert(e.message.includes("Missing PYTHON_BACKEND_URL or API key"), "Error message should indicate missing config");
}
assert.strictEqual(threwMissingConfig, true, "PythonServiceClient must throw if initialized without credentials");
console.log("✅ PythonServiceClient fail-closed check passed.");

// 3. Test Next.js Route Authentication Handlers
console.log("\n3. Testing Next.js route authentication contract simulation...");
function simulateAuthCheck(authHeader, serverSecret) {
  if (!serverSecret || !authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized Internal Request" };
  }
  const token = authHeader.slice(7).trim();
  if (!safeTimingCompare(token, serverSecret)) {
    return { ok: false, status: 401, error: "Unauthorized Internal Request" };
  }
  return { ok: true, status: 200 };
}

const SERVER_SECRET = "test-prod-configured-internal-secret-token";

// 3a. Correct secret accepted
const resValid = simulateAuthCheck(`Bearer ${SERVER_SECRET}`, SERVER_SECRET);
assert.strictEqual(resValid.status, 200, "Valid bearer token must be accepted");

// 3b. Incorrect secret rejected
const resInvalid = simulateAuthCheck("Bearer wrong-secret-token", SERVER_SECRET);
assert.strictEqual(resInvalid.status, 401, "Invalid bearer token must be rejected");

// 3c. Missing client header rejected
const resMissingHeader = simulateAuthCheck(null, SERVER_SECRET);
assert.strictEqual(resMissingHeader.status, 401, "Missing Authorization header must return 401");

// 3d. Missing server secret rejected (server unconfigured / fails closed)
const resServerMissing = simulateAuthCheck(`Bearer ${SERVER_SECRET}`, undefined);
assert.strictEqual(resServerMissing.status, 401, "Missing server secret must fail closed with 401");

const resServerNull = simulateAuthCheck(`Bearer ${SERVER_SECRET}`, null);
assert.strictEqual(resServerNull.status, 401, "Null server secret must fail closed with 401");

// 3e. Legacy fallback secret rejected against configured server
const resLegacy1 = simulateAuthCheck("Bearer internal-python-secret-key-123", SERVER_SECRET);
assert.strictEqual(resLegacy1.status, 401, "Legacy fallback 'internal-python-secret-key-123' must be rejected with 401");

const resLegacy2 = simulateAuthCheck("Bearer python-secret-key-123", SERVER_SECRET);
assert.strictEqual(resLegacy2.status, 401, "Legacy fallback 'python-secret-key-123' must be rejected with 401");

// 3f. Legacy fallback secret cannot authenticate even if server secret is undefined
const resLegacyUnsetServer = simulateAuthCheck("Bearer internal-python-secret-key-123", undefined);
assert.strictEqual(resLegacyUnsetServer.status, 401, "Legacy fallback cannot authenticate when server secret is unset");

console.log("✅ All route authentication contract tests passed.");

console.log("\n🎉 Phase 1F Node.js Authentication Verification Complete!");
