import { generateReport } from "./engine.js";

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
  console.log("Running Reports Engine Tests...\n");

  // 1. Empty/Null/Malformed data
  const reportEmpty = generateReport([], 'weekly');
  assert("empty timeline handles gracefully", reportEmpty.whatHappened[0].includes("No data available"));
  
  const reportNull = generateReport(null, 'monthly');
  assert("null timeline handles gracefully", reportNull.whatHappened[0].includes("No data available"));

  // Create a mock timeline
  const mockTimeline = [
    { date: "2026-09-01", type: "body", label: "Weight", value: "80.0 kg" },
    { date: "2026-09-02", type: "lifestyle", label: "Workout completed", value: true },
    { date: "2026-09-10", type: "body", label: "Weight", value: "79.0 kg" },
    { date: "2026-09-25", type: "lifestyle", label: "Workout completed", value: true },
    { date: "2026-09-26", type: "lifestyle", label: "Workout completed", value: true },
    { date: "2026-09-27", type: "lifestyle", label: "Workout completed", value: true },
    { date: "2026-09-28", type: "body", label: "Weight", value: "78.0 kg" },
    { date: "2026-10-01", type: "body", label: "Weight", value: "77.5 kg" },
    { date: "2026-10-01", type: "insight", label: "AI insight generated", value: "Keep going!" }
  ];

  // 2. Report Periods (Weekly, Monthly, Goal)
  // Weekly ending on 2026-10-01 is 2026-09-25 to 2026-10-01 (7 days)
  const reportWeekly = generateReport(mockTimeline, 'weekly', null, '2026-10-01');
  assert("weekly boundary starts exactly 6 days before current date", reportWeekly.period.start === "2026-09-25");
  assert("weekly report counts correct workouts (3 within period)", reportWeekly.whatHappened.some(s => s.includes("Completed 3 workouts")));
  assert("weekly report detects strong consistency improvement", reportWeekly.whatImproved.some(s => s.includes("Strong workout consistency")));

  // Monthly ending on 2026-10-01 is 2026-09-02 to 2026-10-01 (30 days)
  const reportMonthly = generateReport(mockTimeline, 'monthly', null, '2026-10-01');
  assert("monthly boundary starts exactly 29 days before current date", reportMonthly.period.start === "2026-09-02");
  assert("monthly report filters correctly (skips 09-01 weight)", !reportMonthly.importantTrends.some(s => s.includes("80.0")));

  // Goal (defaults to earliest date if no options provided)
  const reportGoal = generateReport(mockTimeline, 'goal', null, '2026-10-01');
  assert("goal report uses earliest timeline date", reportGoal.period.start === "2026-09-01");

  // Options override
  const reportProgress = generateReport(mockTimeline, 'progress', null, '2026-10-01', { startDate: "2026-09-20" });
  assert("options override startDate", reportProgress.period.start === "2026-09-20");

  // 3. Goal context weight interpretation
  const loseGoal = { domain: 'weight', start_value: 80, target_value: 70 };
  const gainGoal = { domain: 'weight', start_value: 70, target_value: 80 };

  const weightDropTimeline = [
    { date: "2026-10-01", type: "body", label: "Weight", value: "80.0 kg" },
    { date: "2026-10-05", type: "body", label: "Weight", value: "79.0 kg" }
  ];
  
  const weightGainTimeline = [
    { date: "2026-10-01", type: "body", label: "Weight", value: "80.0 kg" },
    { date: "2026-10-05", type: "body", label: "Weight", value: "81.0 kg" }
  ];

  // No goal (neutral interpretation)
  const rDropNoGoal = generateReport(weightDropTimeline, 'weekly', null, '2026-10-05');
  assert("weight drop without goal is neutral (whatHappened)", rDropNoGoal.whatHappened.some(s => s.includes("neutral/uncertain")));
  assert("weight drop without goal is NOT an improvement", rDropNoGoal.whatImproved.length === 0);

  // Lose goal (drop = improved)
  const rDropLoseGoal = generateReport(weightDropTimeline, 'weekly', loseGoal, '2026-10-05');
  assert("weight drop with lose goal IS an improvement", rDropLoseGoal.whatImproved.some(s => s.includes("Weight dropped")));
  
  // Lose goal (gain = declined)
  const rGainLoseGoal = generateReport(weightGainTimeline, 'weekly', loseGoal, '2026-10-05');
  assert("weight gain with lose goal IS a decline", rGainLoseGoal.whatDeclined.some(s => s.includes("Weight increased")));

  // Gain goal (drop = declined)
  const rDropGainGoal = generateReport(weightDropTimeline, 'weekly', gainGoal, '2026-10-05');
  assert("weight drop with gain goal IS a decline", rDropGainGoal.whatDeclined.some(s => s.includes("Weight dropped")));

  // Gain goal (gain = improved)
  const rGainGainGoal = generateReport(weightGainTimeline, 'weekly', gainGoal, '2026-10-05');
  assert("weight gain with gain goal IS an improvement", rGainGainGoal.whatImproved.some(s => s.includes("Weight increased")));

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
