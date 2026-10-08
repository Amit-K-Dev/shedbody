import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { getBoundedProgress } from "@/lib/analytics/progress";
import { getProfileData } from "@/lib/dashboard/getProfileData";
import { getLifestyleData } from "@/lib/dashboard/getLifestyleData";
import { getNutritionData } from "@/lib/dashboard/getNutritionData";
import { getPlans } from "@/lib/storage";
import { getActiveGoal } from "@/lib/goals";

// Re-using the sanitization logic mapped from contextBuilder.js
function sanitizeProfile(profile) {
  if (!profile) return null;
  return {
    heightCm: profile.height !== undefined ? profile.height : null,
    currentWeightKg: profile.weight !== undefined ? profile.weight : null,
  };
}

function sanitizeGoal(activeGoal) {
  if (!activeGoal) return null;
  return {
    domain: activeGoal.domain || null,
    startValue: activeGoal.start_value !== undefined ? activeGoal.start_value : null,
    targetValue: activeGoal.target_value !== undefined ? activeGoal.target_value : null,
    startDate: activeGoal.start_date || null,
    targetDate: activeGoal.target_date || null,
  };
}

function sanitizePlan(activePlan) {
  if (!activePlan) return null;
  return {
    goal: activePlan.goal || null,
    level: activePlan.level || null,
    dietType: activePlan.diet_type || null,
    dailyCalories:
      typeof activePlan.calories === "number" && Number.isFinite(activePlan.calories)
        ? activePlan.calories
        : null,
    dailyProteinGrams:
      typeof activePlan.protein === "number" && Number.isFinite(activePlan.protein)
        ? activePlan.protein
        : null,
  };
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    const internalSecret = process.env.INTERNAL_API_SECRET || "internal-python-secret-key-123";
    if (authHeader !== `Bearer ${internalSecret}`) {
      return NextResponse.json({ error: "Unauthorized Internal Request" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    let startDate = searchParams.get("start_date");
    let endDate = searchParams.get("end_date");

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    if (!endDate) {
      endDate = new Date().toISOString().slice(0, 10);
    }
    if (!startDate) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    }
    
    // Strict date validation
    if (startDate > endDate) {
      return NextResponse.json({ error: "start_date cannot be after end_date" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return NextResponse.json({ error: "Invalid date format. Expected YYYY-MM-DD" }, { status: 400 });
    }

    // Pass the auth context
    const supabase = await createClient();
    const authContext = { supabase, userId };

    const [boundedProgress, profileData, plans, activeWeightGoal, lifestyleLogs, nutritionLogs] = await Promise.all([
      getBoundedProgress(authContext, startDate, endDate),
      getProfileData(authContext),
      getPlans(authContext),
      getActiveGoal("weight", authContext),
      getLifestyleData(authContext, startDate, endDate),
      getNutritionData(authContext, startDate, endDate),
    ]).catch(err => {
      console.error("Data fetch error in intelligence boundary:", err);
      if (err.code === '22P02' || err.message?.includes('invalid input syntax for type uuid')) {
        throw new Error("Identity format mismatch: Supabase requires UUID but received string.");
      }
      throw new Error("DATA_FETCH_FAILED");
    });

    const currentPlan = (plans || []).find((p) => p.is_active === true) || null;

    // Filter fields to minimize payload and preserve privacy boundaries
    const responsePayload = {
      profile: sanitizeProfile(profileData),
      goal: sanitizeGoal(activeWeightGoal),
      plan: sanitizePlan(currentPlan),
      progress: (boundedProgress || []).map(p => ({
        date: p.entry_date,
        weightKg: p.weight,
        bodyFatPercent: p.body_fat
      })),
      nutrition: (nutritionLogs || []).map(n => ({
        date: n.entry_date,
        calories: n.calories,
        proteinGrams: n.protein,
        waterMl: n.water
      })),
      lifestyle: (lifestyleLogs || []).map(l => ({
        date: l.entry_date,
        workoutCompleted: l.workout_completed,
        steps: l.steps,
        sleepHours: l.sleep_hours
      }))
    };

    return NextResponse.json({ data: responsePayload }, { status: 200 });

  } catch (error) {
    if (error.message === "Identity format mismatch: Supabase requires UUID but received string.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Intelligence Boundary API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
