import assert from 'assert';
import { generateNotificationCandidates } from './engine.js';

function runTests() {
  console.log("Running Notification Engine Tests...");
  
  const mockUser = { user_id: 'user-123' };
  
  // Test 1: missing userProfile or currentDate
  assert.deepStrictEqual(generateNotificationCandidates(null, [], [], {}, {}, '2026-10-01'), []);
  assert.deepStrictEqual(generateNotificationCandidates(mockUser, [], [], {}, {}, null), []);
  console.log("✔ Missing data handled safely");

  // Test 2: all preferences explicitly false
  const allFalsePrefs = {
    workout_reminders: false,
    goal_reminders: false,
    habit_reminders: false,
    weekly_progress: false,
    plan_updates: false
  };
  const dummyContext = {
    lifestyleLogs: [{ log_date: '2026-09-20', workout_completed: true }],
    progressEntries: [{ entry_date: '2026-09-20', weight: 80 }],
    adaptationEvents: [{ id: 'evt-1' }]
  };
  const goals = [{ id: 'goal-1', status: 'active', domain: 'weight' }];
  
  assert.deepStrictEqual(
    generateNotificationCandidates(mockUser, [], goals, allFalsePrefs, dummyContext, '2026-10-04'),
    []
  );
  console.log("✔ All preferences false => empty result");

  // Test 3: Workout reminder at exactly 3 full days
  const workoutContext = {
    lifestyleLogs: [{ log_date: '2026-10-01', workout_completed: true }]
  };
  const resWorkout = generateNotificationCandidates(mockUser, [], [], {}, workoutContext, '2026-10-04');
  assert.ok(resWorkout.find(r => r.type === 'workout_reminder'), "Workout reminder missing at 3 days");
  assert.strictEqual(resWorkout.find(r => r.type === 'workout_reminder').deterministic_key, 'workout_reminder_since_2026-10-01');
  console.log("✔ Workout reminder at exactly 3 full days");

  // Test 4: Workout reminder before 3 days
  const resWorkoutEarly = generateNotificationCandidates(mockUser, [], [], {}, workoutContext, '2026-10-03');
  assert.ok(!resWorkoutEarly.find(r => r.type === 'workout_reminder'), "Workout reminder triggered early");
  console.log("✔ Workout reminder before 3 days => no notification");

  // Test 5: Workout reminder key stability
  const resWorkoutLate = generateNotificationCandidates(mockUser, [], [], {}, workoutContext, '2026-10-10');
  assert.strictEqual(
    resWorkout.find(r => r.type === 'workout_reminder').deterministic_key,
    resWorkoutLate.find(r => r.type === 'workout_reminder').deterministic_key
  );
  console.log("✔ Workout reminder key remains stable during same inactivity gap");

  // Test 6: Goal reminder at exactly 5 full days
  const goalContext = {
    progressEntries: [{ entry_date: '2026-10-01', weight: 80 }]
  };
  const resGoal = generateNotificationCandidates(mockUser, [], goals, {}, goalContext, '2026-10-06');
  assert.ok(resGoal.find(r => r.type === 'goal_reminder'), "Goal reminder missing at 5 days");
  assert.strictEqual(resGoal.find(r => r.type === 'goal_reminder').deterministic_key, 'goal_reminder_goal-1_since_2026-10-01');
  console.log("✔ Goal reminder at exactly 5 full days");

  // Test 7: Goal reminder before 5 days
  const resGoalEarly = generateNotificationCandidates(mockUser, [], goals, {}, goalContext, '2026-10-05');
  assert.ok(!resGoalEarly.find(r => r.type === 'goal_reminder'), "Goal reminder triggered early");
  console.log("✔ Goal reminder before 5 days => no notification");

  // Test 8: Inactive goal
  const inactiveGoals = [{ id: 'goal-1', status: 'inactive', domain: 'weight' }];
  const resGoalInactive = generateNotificationCandidates(mockUser, [], inactiveGoals, {}, goalContext, '2026-10-06');
  assert.ok(!resGoalInactive.find(r => r.type === 'goal_reminder'), "Goal reminder triggered for inactive goal");
  console.log("✔ Inactive goal => no reminder");

  // Test 9: Habit reminder at exactly 2 full days
  const habitContext = {
    habitEntries: [{ log_date: '2026-10-01', habit_name: 'meditation', completed: true }]
  };
  const resHabit = generateNotificationCandidates(mockUser, [], [], {}, habitContext, '2026-10-03');
  assert.ok(resHabit.find(r => r.type === 'habit_reminder' && r.deterministic_key.includes('meditation')), "Habit reminder missing");
  console.log("✔ Habit reminder at exactly 2 full days");

  // Test 10: Workout excluded from habit reminders
  const workoutHabitContext = {
    lifestyleLogs: [{ log_date: '2026-10-01', workout_completed: true }]
  };
  const resWorkoutHabit = generateNotificationCandidates(mockUser, [], [], {}, workoutHabitContext, '2026-10-04');
  assert.ok(!resWorkoutHabit.find(r => r.type === 'habit_reminder' && r.deterministic_key.includes('workout')), "Workout habit reminder generated");
  console.log("✔ Workout excluded from habit reminders");

  // Test 11: Habit with no tracking history
  const resNoHabitHistory = generateNotificationCandidates(mockUser, [], [], {}, {}, '2026-10-03');
  assert.strictEqual(resNoHabitHistory.filter(r => r.type === 'habit_reminder').length, 0);
  console.log("✔ Habit with no tracking history => no reminder");

  // Test 12: Weekly progress only on Sunday
  const resSun = generateNotificationCandidates(mockUser, [], [], {}, {}, '2026-10-04'); // Sunday
  assert.ok(resSun.find(r => r.type === 'weekly_progress'), "Weekly progress missing on Sunday");
  assert.strictEqual(resSun.find(r => r.type === 'weekly_progress').deterministic_key, 'weekly_progress_2026-W40');
  
  const resMon = generateNotificationCandidates(mockUser, [], [], {}, {}, '2026-10-05'); // Monday
  assert.ok(!resMon.find(r => r.type === 'weekly_progress'), "Weekly progress generated on Monday");
  console.log("✔ Weekly progress only on Sunday with ISO-week key");

  // Test 13: Plan update
  const planContext = {
    adaptationEvents: [{ id: 'evt-123' }, { id: 'evt-456' }]
  };
  const resPlan = generateNotificationCandidates(mockUser, [], [], {}, planContext, '2026-10-04');
  const planUpdates = resPlan.filter(r => r.type === 'plan_update');
  assert.strictEqual(planUpdates.length, 2);
  assert.strictEqual(planUpdates[0].deterministic_key, 'plan_update_evt-123');
  assert.strictEqual(planUpdates[1].deterministic_key, 'plan_update_evt-456');
  console.log("✔ Plan update generated from adaptation event");

  // Test 14: Identical inputs => Identical outputs
  const combinedContext = {
    lifestyleLogs: [{ log_date: '2026-10-01', workout_completed: true }],
    habitEntries: [{ log_date: '2026-10-01', habit_name: 'meditation', completed: true }],
    progressEntries: [{ entry_date: '2026-10-01', weight: 80 }]
  };
  const resIdentical1 = generateNotificationCandidates(mockUser, [], goals, {}, combinedContext, '2026-10-10');
  const resIdentical2 = generateNotificationCandidates(mockUser, [], goals, {}, combinedContext, '2026-10-10');
  assert.deepStrictEqual(resIdentical1, resIdentical2);
  console.log("✔ Identical inputs always produce identical output");

  console.log("\nAll tests passed successfully!");
}

runTests();
