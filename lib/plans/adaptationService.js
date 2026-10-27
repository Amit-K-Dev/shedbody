"use server";

import { evaluateAdaptationEligibility } from "./eligibilityEngine";
import { calculateAdaptation } from "./adaptationEngine";
import { calculateCalories } from "@/lib/calculations/calorie";
import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter";
import { getUser } from "@/lib/auth/getUser.js";
import { logger, classifyError, pseudonymizeId } from "../observability/logger.js";

function safeErrorDetails(error, operation, userId = null) {
  const classification = classifyError(error);
  const rawCode = error?.code || classification?.code || "DATABASE_ERROR";
  const code =
    typeof rawCode === "string" && rawCode.length < 50 && !rawCode.includes("@") && !rawCode.includes(" ")
      ? rawCode
      : "DATABASE_ERROR";
  const details = {
    operation,
    code,
    category: classification?.category || "DATABASE_ERROR",
  };
  if (userId) {
    const userRef = pseudonymizeId(userId);
    if (userRef) details.userRef = userRef;
  }
  return details;
}

async function getAuthUser(authContext) {
  let user = authContext?.user;
  let supabase = authContext?.supabase;

  if (!user) {
    user = await getUser();
  }

  if (!user && !supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import("@/lib/supabase/server.js");
      supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch {}
  }

  if (!user) throw new Error("Unauthorized access");

  if (authContext?.userId && authContext.userId !== user.id) {
    throw new Error("Unauthorized: Cross-tenant access is prohibited.");
  }

  return { supabase, user };
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Orchestrates the adaptive plan lifecycle.
 * @param {Object} authContext
 * @param {string} currentDateStr - ISO Date string YYYY-MM-DD
 */
export async function checkAndAdaptPlan(authContext, currentDateStr) {
  if (!currentDateStr) {
    currentDateStr = new Date().toISOString().slice(0, 10);
  }

  let currentUserId = authContext?.userId || authContext?.user?.id || null;

  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    let activeWeightGoal, existingEvent, activePlan, userProfile;
    let planRepo, metricRepo;
    const windowStart = addDays(currentDateStr, -6);

    const isD1AdaptiveSelected = process.env.ENABLE_D1_ADAPTIVE === "true";

    if (isD1AdaptiveSelected) {
      const { GoalRepository } = await import("@/lib/repositories/GoalRepository.js");
      const { PlanRepository } = await import("@/lib/repositories/PlanRepository.js");
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();

      const goalRepo = new GoalRepository(adapter);
      planRepo = new PlanRepository(adapter);
      const profileRepo = new ProfileRepository(adapter);
      metricRepo = new MetricRepository(adapter);

      // 1. Load active weight goal
      activeWeightGoal = await goalRepo.getActiveGoal(user.id, "weight");
      if (!activeWeightGoal) {
        return { success: false, reasonCode: "UNSUPPORTED_GOAL", evidence: { error: "No active weight goal." } };
      }

      // 1.5. Idempotency Check
      const sql = `SELECT resulting_plan_id, id FROM adaptation_events WHERE user_id = ? AND goal_id = ? AND evaluation_window_start = ? AND evaluation_window_end = ? LIMIT 1`;
      existingEvent = await adapter.queryOne(sql, [user.id, activeWeightGoal.id, windowStart, currentDateStr]);

      // 2. Load active plan
      activePlan = await planRepo.getActivePlan(user.id);
      if (!activePlan || !activePlan.is_active) {
        return { success: false, reasonCode: "INSUFFICIENT_DATA", evidence: { error: "No active plan." } };
      }

      // 3. Load user profile
      userProfile = await profileRepo.getProfile(user.id);
      if (!userProfile) {
        return { success: false, reasonCode: "INSUFFICIENT_DATA", evidence: { error: "User profile missing." } };
      }

    } else {
      // 1. Load active weight goal
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("domain", "weight")
        .eq("status", "active")
        .maybeSingle();

      if (goalError || !goalData) {
        return { success: false, reasonCode: "UNSUPPORTED_GOAL", evidence: { error: goalError ? goalError.message : "No active weight goal." } };
      }
      activeWeightGoal = goalData;

      // 1.5. Idempotency Check
      const { data: eventData } = await supabase
        .from("adaptation_events")
        .select("resulting_plan_id, id")
        .eq("user_id", user.id)
        .eq("goal_id", activeWeightGoal.id)
        .eq("evaluation_window_start", windowStart)
        .eq("evaluation_window_end", currentDateStr)
        .maybeSingle();
      existingEvent = eventData;

      // 2. Load active plan
      const { data: plans, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      activePlan = plans && plans.length > 0 ? plans[0] : null;
      if (planError || !activePlan || !activePlan.is_active) {
        return { success: false, reasonCode: "INSUFFICIENT_DATA", evidence: { error: planError ? planError.message : "No active plan." } };
      }

      // 3. Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        return { success: false, reasonCode: "INSUFFICIENT_DATA", evidence: { error: profileError ? profileError.message : "User profile missing." } };
      }
      userProfile = profileData;
    }

    if (existingEvent) {
      return {
        success: true,
        plan: {
          resulting_plan_id: existingEvent.resulting_plan_id,
          adaptation_event_id: existingEvent.id,
          is_newly_persisted: false
        },
        snapshot: null // Snapshot not re-generated on idempotent fetch
      };
    }

    // 4. Load Timeline Data (last 7 days inclusive)
    let progressEntries, nutritionLogs;
    
    if (isD1AdaptiveSelected) {
      progressEntries = await metricRepo.getProgress(user.id, { startDate: windowStart, endDate: currentDateStr, orderAsc: true });
      nutritionLogs = await metricRepo.getNutrition(user.id, { startDate: windowStart, endDate: currentDateStr, orderAsc: true });
    } else {
      progressEntries = await MetricReadAdapter.getProgress(
        { supabase, userId: user.id },
        { startDate: windowStart, endDate: currentDateStr, orderAsc: true }
      );

      nutritionLogs = await MetricReadAdapter.getNutrition(
        { supabase, userId: user.id },
        { startDate: windowStart, endDate: currentDateStr, orderAsc: true }
      );
    }

    // Merge into unified timeline
    const timelineMap = new Map();

    (progressEntries || []).forEach((e) => {
      if (!timelineMap.has(e.entry_date)) timelineMap.set(e.entry_date, { date: e.entry_date, metrics: {} });
      const t = timelineMap.get(e.entry_date);
      if (e.weight !== null && e.weight !== undefined) {
        t.metrics.weightKg = Number(e.weight);
      }
    });

    (nutritionLogs || []).forEach((n) => {
      if (!timelineMap.has(n.log_date)) timelineMap.set(n.log_date, { date: n.log_date, metrics: {} });
      const t = timelineMap.get(n.log_date);
      if (n.calories_consumed !== null && n.calories_consumed !== undefined) {
        t.metrics.calories = Number(n.calories_consumed);
      }
      if (n.protein_consumed !== null && n.protein_consumed !== undefined) {
        t.metrics.protein = Number(n.protein_consumed);
      }
    });

    const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // 5. Check Eligibility
    const eligibility = evaluateAdaptationEligibility(timeline, activePlan, activeWeightGoal, currentDateStr);

    if (!eligibility.eligible) {
      return { success: false, reasonCode: eligibility.reasonCode, evidence: eligibility.evidence };
    }

    // 6. Current Weight Extraction (last valid weight in window)
    const validWeights = timeline.filter(
      (t) => t.metrics && typeof t.metrics.weightKg === "number" && Number.isFinite(t.metrics.weightKg)
    );
    if (validWeights.length === 0) {
      return { success: false, reasonCode: "INSUFFICIENT_DATA", evidence: { error: "No valid weight for adaptation." } };
    }
    const currentWeightKg = validWeights[validWeights.length - 1].metrics.weightKg;

    // 7. Fresh TDEE Calculation
    let calcGoal = "maintenance";
    if (activeWeightGoal.start_value > activeWeightGoal.target_value) {
      calcGoal = "fat_loss";
    } else if (activeWeightGoal.start_value < activeWeightGoal.target_value) {
      calcGoal = "muscle_gain";
    }

    const age = Number(userProfile.age);
    const height = Number(userProfile.height);
    const unit = userProfile.unit_system;
    const gender = userProfile.gender;
    const activity = userProfile.level;
    const dietType = activePlan.diet_type;

    if (
      !age || age <= 0 || !Number.isFinite(age) ||
      !height || height <= 0 || !Number.isFinite(height) ||
      !unit || !gender || !activity || !dietType
    ) {
      return {
        success: false,
        reasonCode: "INSUFFICIENT_DATA",
        evidence: { error: "Missing or invalid required demographic data for TDEE calculation." },
      };
    }

    let tdeeResult;
    try {
      tdeeResult = calculateCalories({
        unit,
        gender,
        age,
        height,
        weight: currentWeightKg,
        activity,
        goal: calcGoal,
        dietType,
      });
    } catch (error) {
      return {
        success: false,
        reasonCode: "INSUFFICIENT_DATA",
        evidence: { error: "Failed to calculate fresh TDEE: " + error.message },
      };
    }

    const currentTdee = tdeeResult.maintenanceCalories;

    // 8. Adaptation Engine
    const adaptation = calculateAdaptation({
      eligibility,
      currentCalories: activePlan.calories,
      currentWeightKg,
      currentTdee,
    });

    if (!adaptation.canAdapt) {
      return { success: false, reasonCode: adaptation.status, evidence: { error: adaptation.reason } };
    }

    // 9. Persist Adaptation
    const snapshot = adaptation.snapshot;

    let result;
    if (isD1AdaptiveSelected) {
      result = await planRepo.adaptPlan(user.id, {
        p_goal_id: activeWeightGoal.id,
        p_evaluation_window_start: windowStart,
        p_evaluation_window_end: currentDateStr,
        
        // Adaptation snapshot metrics
        p_previous_calorie_target: snapshot.previousCalorieTarget,
        p_proposed_calorie_target: snapshot.proposedCalorieTarget,
        p_final_calorie_target: snapshot.finalCalorieTarget,
        p_current_weight: snapshot.currentWeight,
        p_current_tdee: snapshot.currentTdee,
        p_is_clamped: snapshot.isClamped,
        p_explanation_snapshot: snapshot,
        
        // Plan payload
        p_plan_goal: activePlan.goal, // Retain existing generic goal text for plans table (e.g. fat_loss)
        p_diet_type: activePlan.diet_type,
        p_level: activePlan.level,
        p_calories: adaptation.planUpdates.calories,
        p_protein: adaptation.planUpdates.protein,
        p_workout: activePlan.workout,
        p_meals: activePlan.meals,
      });
    } else {
      const { data: rpcResult, error: rpcError } = await supabase.rpc("adapt_plan", {
        p_goal_id: activeWeightGoal.id,
        p_evaluation_window_start: windowStart,
        p_evaluation_window_end: currentDateStr,
        
        // Adaptation snapshot metrics
        p_previous_calorie_target: snapshot.previousCalorieTarget,
        p_proposed_calorie_target: snapshot.proposedCalorieTarget,
        p_final_calorie_target: snapshot.finalCalorieTarget,
        p_current_weight: snapshot.currentWeight,
        p_current_tdee: snapshot.currentTdee,
        p_is_clamped: snapshot.isClamped,
        p_explanation_snapshot: snapshot,
        
        // Plan payload
        p_plan_goal: activePlan.goal, // Retain existing generic goal text for plans table (e.g. fat_loss)
        p_diet_type: activePlan.diet_type,
        p_level: activePlan.level,
        p_calories: adaptation.planUpdates.calories,
        p_protein: adaptation.planUpdates.protein,
        p_workout: activePlan.workout,
        p_meals: activePlan.meals,
      });

      if (rpcError) {
        logger.error("ADAPT_PLAN_RPC_FAILED", safeErrorDetails(rpcError, "adaptPlan", currentUserId));
        return { success: false, reasonCode: "RPC_ERROR", evidence: { error: "Adaptation RPC failed" } };
      }
      
      result = rpcResult;
    }

    return { success: true, plan: result, snapshot: snapshot };
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) {
      throw error;
    }
    logger.error("ADAPT_PLAN_FAILED", safeErrorDetails(error, "checkAndAdaptPlan", currentUserId));
    throw error;
  }
}
