import { D1Adapter } from '../lib/repositories/D1Adapter.js';
import { MetricRepository } from '../lib/repositories/MetricRepository.js';
import { NutritionRepository } from '../lib/repositories/NutritionRepository.js';
import { LifestyleRepository } from '../lib/repositories/LifestyleRepository.js';
import Database from 'better-sqlite3';

// 1. Setup in-memory sqlite
const sqlite = new Database(':memory:');
sqlite.exec(`
  CREATE TABLE metric_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    metric_id TEXT NOT NULL,
    log_date TEXT NOT NULL,
    value_numeric REAL,
    source TEXT,
    metadata TEXT,
    deleted_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
  
  CREATE TABLE nutrition_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date TEXT NOT NULL,
    calories_consumed REAL,
    protein_consumed REAL,
    water_ml REAL,
    target_calories_snapshot REAL,
    target_protein_snapshot REAL,
    created_at INTEGER,
    updated_at INTEGER,
    UNIQUE(user_id, log_date)
  );

  CREATE TABLE lifestyle_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date TEXT NOT NULL,
    workout_completed INTEGER,
    steps_count INTEGER,
    sleep_hours REAL,
    created_at INTEGER,
    updated_at INTEGER,
    UNIQUE(user_id, log_date)
  );
  
  CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    calories REAL,
    protein REAL,
    is_active INTEGER,
    deleted_at INTEGER,
    created_at INTEGER
  );
`);

class MockD1Database {
  prepare(sql) {
    return {
      bind: (...params) => {
        return {
          sql,
          params,
          all: async () => {
            const stmt = sqlite.prepare(sql);
            const rows = stmt.all(...params);
            return { results: rows };
          },
          first: async () => {
            const stmt = sqlite.prepare(sql);
            const row = stmt.get(...params);
            return row;
          },
          run: async () => {
            const stmt = sqlite.prepare(sql);
            const info = stmt.run(...params);
            return { success: true, meta: info };
          }
        };
      }
    };
  }
  
  async batch(statements) {
    const runBatch = sqlite.transaction((stmts) => {
      for (const stmt of stmts) {
        // Find if we are intentionally failing
        if (stmt.sql.includes('INTENTIONAL_FAIL')) {
           throw new Error("INTENTIONAL_FAIL");
        }
        const s = sqlite.prepare(stmt.sql);
        s.run(...(stmt.params || []));
      }
    });
    runBatch(statements);
    return [{ success: true }];
  }
}

const mockDb = new MockD1Database();
const adapter = new D1Adapter(mockDb);

const metricRepo = new MetricRepository(adapter);
const nutritionRepo = new NutritionRepository(adapter);
const lifestyleRepo = new LifestyleRepository(adapter);

async function runTests() {
  console.log("Running CF-8 Atomicity Tests...");

  const userId = "user-123";
  const date = "2023-10-10";

  // Test 1: Nutrition - Both succeed
  try {
    const metricStmts = await metricRepo.getCommitStatements(userId, date, { calories: 2000, protein: 150 });
    const nutriStmt = await nutritionRepo.getUpsertStatement(userId, date, 2000, 150, null);
    await adapter.batch([...metricStmts, nutriStmt]);
    console.log("✅ Test 1 Passed: Nutrition batch write succeeded.");
  } catch (e) {
    console.error("❌ Test 1 Failed", e);
  }

  // Test 2: Nutrition - Metric fails -> Relational must not persist
  try {
    const metricStmts = await metricRepo.getCommitStatements(userId, "2023-10-11", { calories: 2500 });
    const nutriStmt = await nutritionRepo.getUpsertStatement(userId, "2023-10-11", 2500, null, null);
    
    // Sabotage the metric statement
    metricStmts[0].sql = "INSERT INTO INTENTIONAL_FAIL";
    
    await adapter.batch([...metricStmts, nutriStmt]);
    console.error("❌ Test 2 Failed: Batch did not throw");
  } catch (e) {
    // Check if it rolled back
    const count = sqlite.prepare("SELECT count(*) as c FROM nutrition_logs WHERE log_date = '2023-10-11'").get().c;
    if (count === 0) {
      console.log("✅ Test 2 Passed: Nutrition atomicity (metric fail -> rollback).");
    } else {
      console.error("❌ Test 2 Failed: Relational row persisted despite metric failure.");
    }
  }

  // Test 3: Lifestyle - Relational fails -> Metric must not persist
  try {
    const metricStmts = await metricRepo.getCommitStatements(userId, "2023-10-12", { steps: 10000 });
    const lifeStmt = await lifestyleRepo.getUpsertStatement(userId, "2023-10-12", null, 10000, null);
    
    // Sabotage the relational statement
    lifeStmt.sql = "INSERT INTO INTENTIONAL_FAIL";
    
    await adapter.batch([...metricStmts, lifeStmt]);
    console.error("❌ Test 3 Failed: Batch did not throw");
  } catch (e) {
    // Check if it rolled back
    const count = sqlite.prepare("SELECT count(*) as c FROM metric_entries WHERE log_date = '2023-10-12'").get().c;
    if (count === 0) {
      console.log("✅ Test 3 Passed: Lifestyle atomicity (relational fail -> rollback).");
    } else {
      console.error("❌ Test 3 Failed: Metric row persisted despite relational failure.");
    }
  }
  
  // Test 4: Idempotent / duplicate writes behave correctly
  try {
    const m1 = await metricRepo.getCommitStatements(userId, date, { calories: 2100 });
    const n1 = await nutritionRepo.getUpsertStatement(userId, date, 2100, 160, 500);
    await adapter.batch([...m1, n1]);
    
    const count = sqlite.prepare("SELECT count(*) as c FROM nutrition_logs WHERE log_date = '2023-10-10'").get().c;
    const nutRow = sqlite.prepare("SELECT calories_consumed FROM nutrition_logs WHERE log_date = '2023-10-10'").get();
    
    if (count === 1 && nutRow.calories_consumed === 2100) {
      console.log("✅ Test 4 Passed: Duplicate writes behave idempotently (ON CONFLICT UPDATE).");
    } else {
      console.error("❌ Test 4 Failed: Idempotency check failed.");
    }
  } catch (e) {
    console.error("❌ Test 4 Failed", e);
  }

  // Test 5: Tenant isolation inside Repositories
  try {
    await metricRepo.getCommitStatements(null, "2023-10-15", { steps: 5000 });
    console.error("❌ Test 5 Failed: Missing userId was not rejected.");
  } catch (e) {
    if (e.message.includes("user_id is required for tenant isolation")) {
      console.log("✅ Test 5 Passed: Missing userId is rejected in Repositories.");
    } else {
      console.error("❌ Test 5 Failed with wrong error:", e);
    }
  }
}

runTests().catch(console.error);
