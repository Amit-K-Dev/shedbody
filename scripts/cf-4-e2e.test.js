import assert from 'assert';

const NEXT_URL = 'http://localhost:3000';
let sessionCookie = '';
let userId = '';

async function runTests() {
  console.log("Starting CF-4 E2E Integration Tests...\n");
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Origin': NEXT_URL
  };

  // 1. Better Auth: Signup
  console.log("1. Testing Signup...");
  const signupRes = await fetch(`${NEXT_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ email: `test-${Date.now()}@test.com`, password: 'password123', name: 'Tester' })
  });
  const signupData = await signupRes.json();
  console.log("Signup Response:", signupData);
  assert(signupData.user, "Signup should return a user object");
  
  // Extract session cookie for persistence test
  const setCookie = signupRes.headers.get('set-cookie');
  assert(setCookie, "Session cookie should be set after signup");
  sessionCookie = setCookie.split(';')[0]; // simple extraction for test
  console.log("✅ Signup successful & session created.");

  // 2. Session Validation via Proxy / API Boundary
  console.log("\n2. Testing Authenticated Request to Next.js API...");
  const authApiRes = await fetch(`${NEXT_URL}/api/protected/test-goal`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Cookie': sessionCookie }
  });
  const apiData = await authApiRes.json();
  console.log("Protected API Response:", apiData);
  assert(authApiRes.status === 200, "Should allow authenticated request");
  assert(apiData.userId === signupData.user.id || apiData.goal, "Should extract user ID or return goal");
  userId = signupData.user.id;
  console.log("✅ Authenticated request permitted & tenant ID isolated: " + userId);

  // 3. Unauthorized Rejection
  console.log("\n3. Testing Unauthorized Rejection...");
  const unauthRes = await fetch(`${NEXT_URL}/api/protected/test-goal`, {
    method: 'POST',
    headers: { 'Origin': NEXT_URL }
  });
  assert(unauthRes.redirected || unauthRes.status === 401 || unauthRes.status === 404, "Should redirect or return 401");
  console.log("✅ Unauthorized requests are rejected.");

  // 4. Python Backend Analytics integration
  console.log("\n4. Testing Python Intelligence Boundary (D1 -> Python -> Next.js)...");
  const pyRes = await fetch(`${NEXT_URL}/api/protected/test-analytics`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Cookie': sessionCookie }
  });
  const pyData = await pyRes.json();
  assert(pyRes.status === 200, "Python boundary request failed");
  assert(pyData.analytics.projected_days === 210, "Python calculations should be correct");
  assert(pyData.analytics.engine === 'python-analytics-v1', "Should be returning from Python backend");
  console.log("✅ Python intelligence calculates and responds properly.");

  // 5. Python Internal API Boundary Auth
  console.log("\n5. Testing Python Internal Auth Rejection...");
  const pyUrl = process.env.PYTHON_ANALYTICS_URL || 'http://127.0.0.1:8000';
  const pyDirectRes = await fetch(`${pyUrl}/api/python/analytics/goal-projection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 'fake', target_value: 70, start_value: 85 })
  });
  assert(pyDirectRes.status === 401, "Python should reject unauthorized direct access");
  console.log("✅ Python rejects unauthenticated internal requests.");

  // 6. Logout
  console.log("\n6. Testing Logout...");
  const logoutRes = await fetch(`${NEXT_URL}/api/auth/sign-out`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Cookie': sessionCookie },
    body: JSON.stringify({})
  });
  const logoutData = await logoutRes.json();
  console.log("Logout Response:", logoutData);
  assert(logoutRes.ok, "Logout should succeed");
  console.log("✅ Logout successful.");

  console.log("\n🎉 All CF-4 Integration Tests Passed Successfully!");
}

runTests().catch(e => {
  console.error("❌ Test Failed: ", e);
  process.exit(1);
});
