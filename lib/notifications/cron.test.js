import { handleCronRequest } from './cronHandler.js';

function createMockRequest(authHeader) {
  return {
    headers: {
      get: (name) => name.toLowerCase() === 'authorization' ? authHeader : null
    }
  };
}

class MockAdminClient {
  constructor(users = []) {
    this.users = users;
    this.updates = [];
  }

  from(table) {
    const builder = {
      select: () => builder,
      order: () => builder,
      limit: () => {
        return Promise.resolve({ data: this.users, error: null });
      },
      update: (data) => {
        return {
          eq: (col, val) => {
            this.updates.push({ table, data, col, val });
            return Promise.resolve({ data: null, error: null });
          }
        };
      }
    };
    return builder;
  }
}

// Polyfill Response for the native Node test runner
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    static json(data, init) {
      return {
        status: init?.status || 200,
        json: () => Promise.resolve(data)
      };
    }
  };
} else {
  // If Response already exists, ensure we have a test-friendly wrapper
  const originalJson = global.Response.json;
  global.Response.json = function(data, init) {
    return {
      status: init?.status || 200,
      json: () => Promise.resolve(data)
    };
  };
}

async function runCronTests() {
  console.log('Running Cron & Sync Tests...\n');
  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} | Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
      failed++;
    }
  }

  const mockSecret = 'test-secret';

  // 1. Cron rejects missing CRON_SECRET
  const res1 = await handleCronRequest(createMockRequest(null), mockSecret, null, null);
  assertEqual(res1.status, 401, 'cron rejects missing CRON_SECRET');

  // 2. Cron rejects incorrect CRON_SECRET
  const res2 = await handleCronRequest(createMockRequest('Bearer wrong-secret'), mockSecret, null, null);
  assertEqual(res2.status, 401, 'cron rejects incorrect CRON_SECRET');

  // 3. Cron processes multiple users, updating timestamp ONLY on success
  const mockUsers = [
    { user_id: 'user-success-1' },
    { user_id: 'user-fail-1' },
    { user_id: 'user-success-2' }
  ];
  const mockAdmin = new MockAdminClient(mockUsers);
  
  const mockCreateAdminClient = () => mockAdmin;

  const mockSyncUser = async ({ userId }) => {
    if (userId === 'user-fail-1') {
      throw new Error('Simulated failure');
    }
    return { success: true, created: 2 };
  };

  const res3 = await handleCronRequest(createMockRequest('Bearer test-secret'), mockSecret, mockCreateAdminClient, mockSyncUser);
  const res3Body = await res3.json();
  
  const updates = mockAdmin.updates;
  
  assertEqual(updates.length, 3, 'both successful and failed user syncs update last_notification_sync');
  const updatedUserIds = updates.map(u => u.val);
  assertEqual(updatedUserIds.includes('user-success-1'), true, 'user-success-1 updated');
  assertEqual(updatedUserIds.includes('user-success-2'), true, 'user-success-2 updated');
  assertEqual(updatedUserIds.includes('user-fail-1'), true, 'user-fail-1 ALSO updated (prevents queue starvation)');
  assertEqual(res3Body.processed, 3, 'processed 3 users');
  assertEqual(res3Body.succeeded, 2, 'succeeded 2 users');
  assertEqual(res3Body.failed, 1, 'failed 1 user');

  console.log(`\nCron Tests Completed: ${passed} passed, ${failed} failed.`);
  
  if (failed > 0) process.exit(1);
}

runCronTests();
