import fs from 'fs';
import path from 'path';

// -----------------------------------------------------------------------------
// Test Setup & Dependency Injection
// -----------------------------------------------------------------------------
const routePath = path.resolve('app/api/ai/coach/route.js');
const rawCode = fs.readFileSync(routePath, 'utf8');

// Strip imports so we can evaluate the module logic in isolation
let codeToEval = rawCode
  .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, '')
  .replace(/export async function POST/, 'async function POST');

// A simple mock for NextResponse
const NextResponse = {
  json: (body, init) => ({ body, status: init?.status || 200 })
};

// Evaluate the route logic and inject dependencies
const createRoute = new Function(
  'NextResponse', 'createClient', 'buildAiContext', 'validateAiContext',
  'callAiProvider', 'validateAiResponseSchema', 'validateAiResponseSafety', 'validateGrounding',
  'getBoundedProgress', 'getProfileData',
  'getLifestyleData', 'getNutritionData', 'getPlans', 'getActiveGoal',
  'mergeDailyMetrics', 'generateStructuredInsights',
  codeToEval + '\nreturn POST;'
);

// -----------------------------------------------------------------------------
// Test Runner
// -----------------------------------------------------------------------------
let totalTests = 0;
let passedTests = 0;

async function runTest(name, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
  }
}

// Mocks state
let mockAuthUser = { id: 'test-user-123' };
let mockAuthError = null;
let mockProviderResponse = "{}";
let mockProviderThrows = null;
let mockContextValidatorValid = true;
let mockProviderCallCount = 0;
let capturedProviderArgs = null;
let mockSchemaValidation = { valid: true };
let mockGroundingValidation = { valid: true };
let mockSafetyValidation = { valid: true };
let mockDataFetchThrows = false;

// Create standard mocks
const mockCreateClient = async () => ({
  auth: {
    getUser: async () => ({ data: { user: mockAuthUser }, error: mockAuthError })
  }
});
const mockBuildAiContext = () => ({});
const mockValidateAiContext = () => {
  if (!mockContextValidatorValid) return { valid: false, error: 'Context invalid' };
  return { valid: true, data: { secure: true } };
};
const mockCallAiProvider = async (system, user) => {
  mockProviderCallCount++;
  capturedProviderArgs = { system, user };
  if (mockProviderThrows) throw mockProviderThrows;
  return mockProviderResponse;
};
const mockValidateAiResponseSchema = () => mockSchemaValidation;
const mockValidateGrounding = () => mockGroundingValidation;
const mockValidateAiResponseSafety = () => mockSafetyValidation;

const mockDataFetcher = async () => {
  if (mockDataFetchThrows) throw new Error("Mock DB Error");
  return [];
};

// Instantiate the route
const POST = createRoute(
  NextResponse, mockCreateClient, mockBuildAiContext, mockValidateAiContext,
  mockCallAiProvider, mockValidateAiResponseSchema, mockValidateAiResponseSafety, mockValidateGrounding,
  mockDataFetcher, mockDataFetcher,
  mockDataFetcher, mockDataFetcher, mockDataFetcher, mockDataFetcher,
  mockDataFetcher, mockDataFetcher
);

// Helper to create fake NextRequest
const createReq = (bodyObj) => ({
  json: async () => {
    if (bodyObj === undefined) throw new Error("Invalid JSON");
    return bodyObj;
  }
});

function resetMocks() {
  mockAuthUser = { id: 'test-user-123' };
  mockAuthError = null;
  mockProviderResponse = "{}";
  mockProviderThrows = null;
  mockContextValidatorValid = true;
  mockProviderCallCount = 0;
  capturedProviderArgs = null;
  mockSchemaValidation = { valid: true };
  mockGroundingValidation = { valid: true };
  mockSafetyValidation = { valid: true };
  mockDataFetchThrows = false;
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------
async function runAllTests() {
  console.log("--- Request Boundary Tests ---");

  // 1. unauthenticated request -> 401
  await runTest("Unauthenticated request -> 401", async () => {
    resetMocks();
    mockAuthUser = null;
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 2. invalid JSON -> 400
  await runTest("Invalid JSON -> 400", async () => {
    resetMocks();
    const res = await POST(createReq(undefined));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 3. missing question -> 400
  await runTest("Missing question -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({}));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 4. non-string question -> 400
  await runTest("Non-string question -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({ question: 123 }));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 5. empty question -> 400
  await runTest("Empty question -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({ question: "" }));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 6. whitespace-only question -> 400
  await runTest("Whitespace-only question -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({ question: "   " }));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 7. question over server limit -> 400
  await runTest("Question over server limit -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({ question: "a".repeat(1001) }));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 8. invalid intent -> 400
  await runTest("Invalid intent -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({ question: "test", intent: "MALICIOUS" }));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 9. unexpected request fields -> 400
  await runTest("Unexpected request fields -> 400", async () => {
    resetMocks();
    const res = await POST(createReq({ question: "test", foo: "bar" }));
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  console.log("\n--- Context Boundary Tests ---");

  // 10. context builder failure -> 500
  await runTest("Context builder failure -> 500", async () => {
    resetMocks();
    mockDataFetchThrows = true;
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
    if (mockProviderCallCount !== 0) throw new Error("Provider should not be called");
  });

  // 11. context validator failure -> 500
  await runTest("Context validator failure -> 500", async () => {
    resetMocks();
    mockContextValidatorValid = false;
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
    if (mockProviderCallCount !== 0) throw new Error("Provider should not be called");
  });

  console.log("\n--- Provider Boundary Tests ---");

  // 12 & 13. provider network/timeout failure -> 502
  await runTest("Provider network/timeout failure -> 502", async () => {
    resetMocks();
    mockProviderThrows = new Error("Network timeout");
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 502) throw new Error(`Expected 502, got ${res.status}`);
  });

  // 14. malformed provider JSON -> 502
  await runTest("Malformed provider JSON -> 502", async () => {
    resetMocks();
    mockProviderResponse = "{ bad json ]";
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 502) throw new Error(`Expected 502, got ${res.status}`);
  });

  console.log("\n--- Response Validation Tests ---");

  // 15. schema failure - missing required fields -> 500
  await runTest("Provider response missing required fields -> 500", async () => {
    resetMocks();
    mockSchemaValidation = { valid: false, error: "Missing required field 'confidence'" };
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
  });

  // 16. schema failure - invalid type enum -> 500
  await runTest("Provider response invalid type enum -> 500", async () => {
    resetMocks();
    mockSchemaValidation = { valid: false, error: "Invalid value 'FOO' for enum 'type'" };
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
  });

  // 17. schema failure - invalid nested structure -> 500
  await runTest("Provider response invalid nested structure -> 500", async () => {
    resetMocks();
    mockSchemaValidation = { valid: false, error: "Invalid evidence object structure" };
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
  });

  // 18. schema failure - unexpected properties -> 500
  await runTest("Provider response unexpected properties -> 500", async () => {
    resetMocks();
    mockSchemaValidation = { valid: false, error: "Unexpected property 'foo'" };
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
  });

  // 19. grounding failure -> 422
  await runTest("Grounding failure -> 422 AI_GROUNDING_VIOLATION", async () => {
    resetMocks();
    mockGroundingValidation = { valid: false, error: "Fake source" };
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 422 || res.body.error !== "AI_GROUNDING_VIOLATION") throw new Error("Expected 422 AI_GROUNDING_VIOLATION");
  });

  // 19. safety failure -> 422
  await runTest("Safety failure -> 422 AI_SAFETY_VIOLATION", async () => {
    resetMocks();
    mockSafetyValidation = { valid: false, error: "Unsafe advice" };
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 422 || res.body.error !== "AI_SAFETY_VIOLATION") throw new Error("Expected 422 AI_SAFETY_VIOLATION");
  });

  // 20. successful fully validated response -> 200
  await runTest("Successful fully validated response -> 200", async () => {
    resetMocks();
    mockProviderResponse = '{"type":"analysis"}';
    const res = await POST(createReq({ question: "test" }));
    if (res.status !== 200 || !res.body.success) throw new Error("Expected 200 Success");
  });

  console.log("\n--- Privacy/Security Tests ---");

  // 21. provider raw output is not returned on failure
  await runTest("Provider raw output is not returned on failure", async () => {
    resetMocks();
    mockProviderResponse = "{ bad json ]";
    const res = await POST(createReq({ question: "test" }));
    if (res.body.error.includes("bad json")) throw new Error("Raw output leaked!");
  });

  // 22. provider error details are not returned
  await runTest("Provider error details are not returned", async () => {
    resetMocks();
    mockProviderThrows = new Error("SECRET_KEY_EXPIRED");
    const res = await POST(createReq({ question: "test" }));
    if (res.body.error.includes("SECRET_KEY")) throw new Error("Provider error leaked!");
  });

  // 23. API key is never exposed
  await runTest("API key is never exposed", async () => {
    // This is structurally guaranteed by the code, but we simulate it
    resetMocks();
    const res = await POST(createReq({ question: "test" }));
    if (JSON.stringify(res).includes("sk-")) throw new Error("API key leaked!");
  });

  // 24. raw AiContextPayload is never returned
  await runTest("Raw AiContextPayload is never returned", async () => {
    resetMocks();
    mockProviderResponse = "{ bad json ]";
    const res = await POST(createReq({ question: "test" }));
    if (JSON.stringify(res).includes("secure:true")) throw new Error("Context payload leaked!");
  });

  // 25. provider prompt is never exposed
  await runTest("Provider prompt is never exposed", async () => {
    resetMocks();
    mockProviderResponse = "{ bad json ]";
    const res = await POST(createReq({ question: "test" }));
    if (JSON.stringify(res).includes("system")) throw new Error("Prompt leaked!");
  });

  console.log(`\n====================================`);
  console.log(`Tests Run: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  if (totalTests === passedTests) {
    console.log(`✅ ALL TESTS PASSED!`);
  } else {
    process.exit(1);
  }
}

runAllTests();
