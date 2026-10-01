import { generateNotificationCandidates } from './engine.js';
import { PREDEFINED_HABITS } from '../habits/engine.js';

// Simple mock for days difference
const currentDate = '2026-10-01';

const userProfile = { user_id: 'user-123' };
const preferences = { workout_reminders: true, goal_reminders: true, habit_reminders: true, weekly_progress: false, plan_updates: false };

function runIntegrationTests() {
  console.log('Running Notification Integration Boundary Tests...\n');

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    if (actual === expected) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} | Expected: ${expected}, Got: ${actual}`);
      failed++;
    }
  }

  // 1. WORKOUT: last completion >30 days ago still reaches the engine
  const workoutAnchor = { log_date: '2026-08-01', workout_completed: true }; // 61 days ago
  const systemContextWorkout = {
    lifestyleLogs: [workoutAnchor], // Simulated anchor appended to empty 30-day window
    nutritionLogs: [],
    habitEntries: [],
    progressEntries: []
  };
  const workoutCandidates = generateNotificationCandidates(userProfile, [], [], preferences, systemContextWorkout, currentDate);
  assertEqual(workoutCandidates.length, 1, 'Workout anchor >30 days correctly triggers reminder');
  if (workoutCandidates[0]) {
    assertEqual(workoutCandidates[0].type, 'workout_reminder', 'Correct notification type');
    assertEqual(workoutCandidates[0].deterministic_key, 'workout_reminder_since_2026-08-01', 'Correct deterministic key for workout');
  }

  // 2. HABIT: last meditation completion >30 days ago still reaches the engine
  const meditationAnchor = { log_date: '2026-08-15', habit_name: 'meditation', completed: true }; // 47 days ago
  const systemContextHabit = {
    lifestyleLogs: [],
    nutritionLogs: [],
    habitEntries: [meditationAnchor],
    progressEntries: []
  };
  const habitCandidates = generateNotificationCandidates(userProfile, [], [], preferences, systemContextHabit, currentDate);
  assertEqual(habitCandidates.length, 1, 'Habit anchor >30 days correctly triggers reminder');
  if (habitCandidates[0]) {
    assertEqual(habitCandidates[0].type, 'habit_reminder', 'Correct habit notification type');
    assertEqual(habitCandidates[0].deterministic_key, 'habit_reminder_meditation_since_2026-08-15', 'Correct deterministic key for habit');
  }

  // 3. HABIT: never-tracked meditation remains distinguishable from old history
  const systemContextEmptyHabits = {
    lifestyleLogs: [],
    nutritionLogs: [],
    habitEntries: [], // No anchors, completely empty history
    progressEntries: []
  };
  const emptyHabitCandidates = generateNotificationCandidates(userProfile, [], [], preferences, systemContextEmptyHabits, currentDate);
  assertEqual(emptyHabitCandidates.length, 0, 'Never tracked habits trigger no reminders');

  // 4. GOAL: last weight entry >30 days ago still reaches the engine
  const goalAnchor = { entry_date: '2026-07-01', weight: 80.5 }; // 92 days ago
  const systemContextGoal = {
    lifestyleLogs: [],
    nutritionLogs: [],
    habitEntries: [],
    progressEntries: [goalAnchor]
  };
  const mockGoals = [{ id: 'goal-1', status: 'active', domain: 'weight' }];
  const goalCandidates = generateNotificationCandidates(userProfile, [], mockGoals, preferences, systemContextGoal, currentDate);
  assertEqual(goalCandidates.length, 1, 'Goal progress anchor >30 days correctly triggers reminder');
  if (goalCandidates[0]) {
    assertEqual(goalCandidates[0].type, 'goal_reminder', 'Correct goal notification type');
    assertEqual(goalCandidates[0].deterministic_key, 'goal_reminder_goal-1_since_2026-07-01', 'Correct deterministic key for goal');
  }

  // 5. GOAL: no weight entry ever remains distinguishable from old history
  const systemContextEmptyGoal = {
    lifestyleLogs: [],
    nutritionLogs: [],
    habitEntries: [],
    progressEntries: [] // No history
  };
  const emptyGoalCandidates = generateNotificationCandidates(userProfile, [], mockGoals, preferences, systemContextEmptyGoal, currentDate);
  assertEqual(emptyGoalCandidates.length, 0, 'No goal progress ever triggers no reminders');

  // 6. IDEMPOTENCY: same deterministic key remains unchanged across repeated sync evaluation
  // The engine just generates candidates. Idempotency is proven by the deterministic key generation being identical.
  const sync1 = generateNotificationCandidates(userProfile, [], mockGoals, preferences, systemContextGoal, currentDate);
  const sync2 = generateNotificationCandidates(userProfile, [], mockGoals, preferences, systemContextGoal, currentDate);
  assertEqual(sync1[0]?.deterministic_key, sync2[0]?.deterministic_key, 'Deterministic key is identical across multiple sync evaluations');

  console.log(`\nIntegration Boundary Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runIntegrationTests();
