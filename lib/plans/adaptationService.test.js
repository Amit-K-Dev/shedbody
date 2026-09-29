import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateAdaptationEligibility } from "./eligibilityEngine.js";
import { calculateAdaptation } from "./adaptationEngine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let serviceCode = fs.readFileSync(path.join(__dirname, 'adaptationService.js'), 'utf8');

// Strip out standard imports to bypass bare Node path alias failures
serviceCode = serviceCode
  .replace(/import \{ evaluateAdaptationEligibility \} from ".*eligibilityEngine";/, '')
  .replace(/import \{ calculateAdaptation \} from ".*adaptationEngine";/, '')
  .replace(/import \{ calculateCalories \} from ".*calculations\/calorie";/, '');

// Replace ES module export with CJS-style assignment for dynamic evaluation
serviceCode = serviceCode.replace('export async function checkAndAdaptPlan', 'exports.checkAndAdaptPlan = async function checkAndAdaptPlan');

// Stubs for testing
const calculateCalories = (inputs) => {
  if (inputs.weight === "not a number" || !inputs.height || !inputs.age || inputs.height < 0) {
    throw new Error("Mocked Calculator Error");
  }
  if (inputs.weight === 85) return { maintenanceCalories: 2700 };
  return { maintenanceCalories: 2000 };
};

const exportsObj = {};
const moduleFn = new Function('exports', 'evaluateAdaptationEligibility', 'calculateAdaptation', 'calculateCalories', serviceCode);
moduleFn(exportsObj, evaluateAdaptationEligibility, calculateAdaptation, calculateCalories);

const { checkAndAdaptPlan } = exportsObj;

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name}`);
  }
}

// Mock Supabase client
function createMockSupabase(mockData) {
  const chain = (data) => ({
    select: () => chain(data),
    eq: () => chain(data),
    is: () => chain(data),
    gte: () => chain(data),
    lte: () => chain(data),
    order: () => chain(data),
    limit: () => chain(data),
    maybeSingle: async () => ({ data, error: null }),
    single: async () => ({ data, error: null }),
    then: (resolve) => resolve({ data, error: null })
  });

  return {
    from: (table) => {
      if (table === "goals") return chain(mockData.activeWeightGoal);
      if (table === "plans") return chain(mockData.activePlan ? [mockData.activePlan] : []);
      if (table === "user_profiles") return chain(mockData.userProfile);
      if (table === "progress_entries") return chain(mockData.progressEntries || []);
      if (table === "nutrition_logs") {
        if (mockData.nutritionError) {
          const errorChain = (data) => ({
            select: () => errorChain(data),
            eq: () => errorChain(data),
            gte: () => errorChain(data),
            lte: () => errorChain(data),
            order: () => errorChain(data),
            then: (resolve) => resolve({ data: null, error: new Error(mockData.nutritionError) })
          });
          return errorChain(null);
        }
        return chain(mockData.nutritionLogs || []);
      }
      return chain(null);
    },
    rpc: async (fnName, args) => {
      if (fnName === "adapt_plan") {
        if (mockData.rpcError) {
          return { data: null, error: new Error(mockData.rpcError) };
        }
        mockData.rpcCalledWith = args;
        return { data: { id: "new-plan-id", ...args }, error: null };
      }
      return { data: null, error: null };
    }
  };
}

async function runTests() {
  console.log("Running B2-U Adaptation Service Tests...\n");

  const baseDate = "2026-09-20";
  const userId = "test-user";
  const goalId = "test-goal";

  // Scenario 1: Missing active weight goal
  let authContext = {
    supabase: createMockSupabase({ activeWeightGoal: null }),
    user: { id: userId }
  };
  let res = await checkAndAdaptPlan(authContext, baseDate);
  assert("Missing active weight goal blocks adaptation", res.success === false && res.reasonCode === "UNSUPPORTED_GOAL");

  // Scenario 2: Successful loss adaptation
  // Need: goal, plan, profile, timeline (7 days of nutrition & weight to trigger eligible_plateau)
  const goodWeightGoal = { id: goalId, user_id: userId, domain: "weight", status: "active", start_value: 90, target_value: 80 };
  const goodPlan = { id: "plan1", user_id: userId, is_active: true, calories: 2000, diet_type: "veg", level: "intermediate", goal: "fat_loss" };
  const goodProfile = { user_id: userId, gender: "male", age: 30, height: 180, level: "moderate", unit_system: "metric" };
  
  // Create a plateau timeline
  const progressEntries = [];
  const nutritionLogs = [];
  for (let i = 0; i <= 6; i++) {
    const d = new Date("2026-09-14T00:00:00Z");
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    // Plateau weight around 85kg
    progressEntries.push({ entry_date: dateStr, weight: 85.0 });
    // Perfect adherence
    nutritionLogs.push({ log_date: dateStr, calories_consumed: 2000, protein_consumed: 150 });
  }

  let mockData = {
    activeWeightGoal: goodWeightGoal,
    activePlan: goodPlan,
    userProfile: goodProfile,
    progressEntries,
    nutritionLogs
  };

  authContext = { supabase: createMockSupabase(mockData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  
  assert("Successful loss adaptation returns new plan and snapshot", 
    res.success === true && 
    res.snapshot.goalDirection === "lose" && 
    res.plan.p_calories === 1900 &&
    mockData.rpcCalledWith.p_goal_id === goalId
  );

  // Scenario 3: Gain adaptation (starts 80, target 90)
  mockData.activeWeightGoal = { ...goodWeightGoal, start_value: 80, target_value: 90 };
  mockData.activePlan = { ...goodPlan, calories: 2500 }; // Ensure it doesn't max out (TDEE ~2700)
  // Nutrition adherence for 2500
  mockData.nutritionLogs = nutritionLogs.map(n => ({ ...n, calories_consumed: 2500 }));
  // Plateau weight at 85
  
  authContext = { supabase: createMockSupabase(mockData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  
  if (!(res.success === true && res.snapshot.goalDirection === "gain" && res.plan.p_calories === 2600 && mockData.rpcCalledWith.p_goal_id === goalId)) {
    console.log("Gain res:", res);
  }
  
  assert("Successful gain adaptation returns new plan and snapshot", 
    res.success === true && 
    res.snapshot.goalDirection === "gain" && 
    res.plan.p_calories === 2600 &&
    mockData.rpcCalledWith.p_goal_id === goalId
  );

  // Scenario 4: Failed RPC
  mockData.activeWeightGoal = goodWeightGoal;
  mockData.activePlan = goodPlan;
  mockData.nutritionLogs = nutritionLogs;
  mockData.rpcError = "Database error";
  authContext = { supabase: createMockSupabase(mockData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  if (!(res.success === false && res.reasonCode === "RPC_ERROR")) {
    console.log("RPC failure res:", res);
  }
  assert("RPC Error returns success=false and RPC_ERROR", res.success === false && res.reasonCode === "RPC_ERROR");
  mockData.rpcError = null;

  // Scenario 5: Missing required profile field
  let badProfileData = { ...mockData, userProfile: { ...goodProfile, age: null } };
  authContext = { supabase: createMockSupabase(badProfileData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  assert("Missing required profile field (age) returns INSUFFICIENT_DATA", res.success === false && res.reasonCode === "INSUFFICIENT_DATA");

  // Scenario 6: Invalid required profile field
  badProfileData = { ...mockData, userProfile: { ...goodProfile, height: -10 } };
  authContext = { supabase: createMockSupabase(badProfileData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  assert("Invalid required profile field (height) returns INSUFFICIENT_DATA", res.success === false && res.reasonCode === "INSUFFICIENT_DATA");

  // Scenario 7: Missing current weight
  let badTimelineData = { ...mockData, progressEntries: progressEntries.map(e => ({ ...e, weight: null })) };
  authContext = { supabase: createMockSupabase(badTimelineData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  assert("Missing current weight returns INSUFFICIENT_DATA", res.success === false && res.reasonCode === "INSUFFICIENT_DATA");

  // Scenario 8: Invalid current weight
  badTimelineData = { ...mockData, progressEntries: progressEntries.map(e => ({ ...e, weight: "not a number" })) };
  authContext = { supabase: createMockSupabase(badTimelineData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  assert("Invalid current weight returns INSUFFICIENT_DATA", res.success === false && res.reasonCode === "INSUFFICIENT_DATA");

  // Scenario 9: DB Error on nutrition load
  let errorNutritionData = { ...mockData, nutritionError: "DB Error" };
  authContext = { supabase: createMockSupabase(errorNutritionData), user: { id: userId } };
  res = await checkAndAdaptPlan(authContext, baseDate);
  assert("DB Error on nutrition load fails closed with INSUFFICIENT_DATA", res.success === false && res.reasonCode === "INSUFFICIENT_DATA" && res.evidence.error === "DB Error");

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
}

runTests();
