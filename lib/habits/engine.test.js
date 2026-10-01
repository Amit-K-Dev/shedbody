import { generateHabitMatrix } from "./engine.js";

let passed = 0;
let failed = 0;

function assert(name, condition, details = "") {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name} ${details}`);
  }
}

function runTests() {
  console.log("Running Habit Engine Tests...\n");

  // 1. empty data
  let matrix = generateHabitMatrix([], [], []);
  assert("empty data returns empty array", Array.isArray(matrix) && matrix.length === 0);

  // 2. valid habit entries (baseline)
  const habitEntries = [{ log_date: "2026-10-01", habit_name: "meditation", completed: true }];
  matrix = generateHabitMatrix(habitEntries, [], []);
  assert("valid habit entry sets boolean flag", matrix.length === 1 && matrix[0].habits.meditation === true);

  // 3. completion state derived from native metrics
  const lifestyleLogs = [{ log_date: "2026-10-01", workout_completed: true, steps_count: 500, sleep_hours: 8 }];
  const nutritionLogs = [{ log_date: "2026-10-01", water_ml: 2000, protein_consumed: 100 }];
  matrix = generateHabitMatrix(habitEntries, lifestyleLogs, nutritionLogs);
  
  assert("derived metrics accurately set boolean completion", 
    matrix[0].habits.workout === true &&
    matrix[0].habits.steps === true &&
    matrix[0].habits.water === true &&
    matrix[0].habits.sleep === true &&
    matrix[0].habits.protein === true &&
    matrix[0].habits.meditation === true
  );

  // 4. completion state correctly ignores zero/null values
  const lifestyleEmpty = [{ log_date: "2026-10-02", workout_completed: false, steps_count: 0, sleep_hours: null }];
  const nutritionEmpty = [{ log_date: "2026-10-02", water_ml: 0, protein_consumed: null }];
  matrix = generateHabitMatrix([], lifestyleEmpty, nutritionEmpty);
  assert("zero/null metrics do not trigger completion", 
    matrix[0].habits.workout === false &&
    matrix[0].habits.steps === false &&
    matrix[0].habits.water === false &&
    matrix[0].habits.sleep === false &&
    matrix[0].habits.protein === false
  );

  // 5. date ordering
  const h2 = [{ log_date: "2026-10-01", habit_name: "meditation", completed: true }, { log_date: "2026-10-03", habit_name: "meditation", completed: true }];
  matrix = generateHabitMatrix(h2, [], []);
  assert("dates are sorted descending (newest first)", matrix[0].date === "2026-10-03" && matrix[1].date === "2026-10-01");

  // 6. duplicate handling (same date, same metric type)
  // Our generator maps by date, so if there are multiple logs for the same day, it should just be set to true if ANY are true.
  const lMulti = [
    { log_date: "2026-10-05", workout_completed: false },
    { log_date: "2026-10-05", workout_completed: true }
  ];
  matrix = generateHabitMatrix([], lMulti, []);
  assert("multiple logs for same day correctly evaluate true if any are true", matrix.length === 1 && matrix[0].habits.workout === true);

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
