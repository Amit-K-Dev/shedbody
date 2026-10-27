"use server";

import { MetricReadAdapter } from "@/lib/repositories/MetricReadAdapter.js";
import { MetricWriteAdapter } from "@/lib/repositories/MetricWriteAdapter.js";
import { getUser } from "@/lib/auth/getUser.js";
import { logger, classifyError, pseudonymizeId } from "./observability/logger.js";

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

// Helper function to get secure user from verified session
async function getAuthUser(authContext) {
  let user = authContext?.user;
  let supabase = authContext?.supabase;

  if (!user) {
    user = await getUser();
  }

  if (!user) {
    throw new Error("Unauthorized access");
  }

  // Security enforcement: A client-provided userId must never override or mismatch verified session
  const claimedId = authContext?.userId || authContext?.user?.id;
  if (claimedId && claimedId !== user.id) {
    throw new Error("Unauthorized: Cross-tenant access is prohibited.");
  }

  return { supabase, user };
}

function isD1PlansEnabled() {
  return process.env.ENABLE_D1_PLANS === "true";
}

function isD1MetricsEnabled() {
  return process.env.ENABLE_D1_METRICS === "true";
}

function isD1ProfileEnabled() {
  return process.env.ENABLE_D1_PROFILE === "true";
}

// ==========================================
// PLANS SECTION
// ==========================================

export async function getPlans(authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    if (isD1PlansEnabled()) {
      try {
        const { PlanRepository } = await import("@/lib/repositories/PlanRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const repo = new PlanRepository(new D1Adapter());
        const d1Plans = await repo.getPlans(user.id);
        if (d1Plans) {
          return d1Plans;
        }
      } catch (d1Error) {
        logger.warn("D1_READ_FALLBACK", safeErrorDetails(d1Error, "getPlans", currentUserId));
        // Safe read fallback to Supabase below
      }
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import("@/lib/supabase/server");
      const client = supabase || (await createClient());
      const { data, error } = await client
        .from("plans")
        .select(
          "id, goal, level, diet_type, calories, protein, workout, meals, is_active, created_at",
        )
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }

    return [];
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    logger.error("GET_PLANS_FAILED", safeErrorDetails(error, "getPlans", currentUserId));
    return [];
  }
}

export async function savePlan(plan, authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;
    const { dietType, ...rest } = plan;

    if (process.env.ENABLE_D1_PLANS === "true") {
      const { PlanRepository } = await import("@/lib/repositories/PlanRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const repo = new PlanRepository(adapter);
      return await repo.savePlan(user.id, { dietType, ...rest });
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const { data: savedPlan, error } = await client
      .rpc("upsert_plan", {
        p_goal: rest.goal,
        p_diet_type: dietType,
        p_level: rest.level,
        p_calories: rest.calories,
        p_protein: rest.protein,
        p_workout: rest.workout || null,
        p_meals: rest.meals || null,
      })
      .single();

    if (error) throw error;
    return savedPlan;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    logger.error("SAVE_PLAN_FAILED", safeErrorDetails(error, "savePlan", currentUserId));
    throw error;
  }
}

export async function deletePlan(id, authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    if (process.env.ENABLE_D1_PLANS === "true") {
      const { PlanRepository } = await import("@/lib/repositories/PlanRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const repo = new PlanRepository(adapter);
      await repo.deletePlan(user.id, id);
      return;
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const { error } = await client.rpc("soft_delete_plan", { p_id: id });
    if (error) throw error;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    logger.error("DELETE_PLAN_FAILED", safeErrorDetails(error, "deletePlan", currentUserId));
    throw error;
  }
}

export async function clearAllPlans(authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    if (process.env.ENABLE_D1_PLANS === "true") {
      const { PlanRepository } = await import("@/lib/repositories/PlanRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const repo = new PlanRepository(adapter);
      await repo.clearAllPlans(user.id);
      return;
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const { error } = await client.rpc("clear_all_plans");
    if (error) throw error;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    logger.error("CLEAR_ALL_PLANS_FAILED", safeErrorDetails(error, "clearAllPlans", currentUserId));
    throw error;
  }
}

// ==========================================
// PROGRESS SECTION
// ==========================================

export async function getProgress(authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    if (isD1MetricsEnabled()) {
      try {
        const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const repo = new MetricRepository(new D1Adapter());
        const d1Data = await repo.getProgress(user.id, { orderAsc: true, limit: 100 });
        if (d1Data) {
          return d1Data;
        }
      } catch (d1Error) {
        logger.warn("D1_READ_FALLBACK", safeErrorDetails(d1Error, "getProgress", currentUserId));
      }
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const data = await MetricReadAdapter.getProgress(
      { supabase: client, userId: user.id },
      { orderAsc: true, limit: 100 }
    );

    return data || [];
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    logger.error("GET_PROGRESS_FAILED", safeErrorDetails(error, "getProgress", currentUserId));
    return [];
  }
}

export async function addProgressEntry(entry, authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;
    const entryDate = entry.entry_date || new Date().toISOString().slice(0, 10);

    const payload = {
      weight: entry.weight,
      body_fat: entry.body_fat
    };

    if (process.env.ENABLE_D1_METRICS === "true") {
      const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const repo = new MetricRepository(adapter);
      await repo.commit(user.id, entryDate, payload, 'manual');
      return payload;
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const { data, error } = await MetricWriteAdapter.commit(
      { supabase: client, userId: user.id, logDate: entryDate },
      payload,
      'manual'
    );

    if (error) throw error;
    return data;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    if (error.message?.includes("Unauthorized access")) {
      logger.error("ADD_PROGRESS_ENTRY_UNAUTHORIZED", safeErrorDetails(error, "addProgressEntry", currentUserId));
      return null;
    }
    logger.error("ADD_PROGRESS_ENTRY_FAILED", safeErrorDetails(error, "addProgressEntry", currentUserId));
    throw error;
  }
}

// ==========================================
// USER PROFILE SECTION
// ==========================================

export async function getUserProfile() {
  let currentUserId = null;
  try {
    const { supabase, user } = await getAuthUser();
    currentUserId = user.id;

    if (isD1ProfileEnabled()) {
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const repo = new ProfileRepository(new D1Adapter());
      try {
        const d1Data = await repo.getProfile(user.id);
        return d1Data;
      } catch (d1Error) {
        logger.warn("D1_READ_FALLBACK", safeErrorDetails(d1Error, "getUserProfile", currentUserId));
      }
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import("@/lib/supabase/server");
      const client = supabase || (await createClient());
      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function saveUserProfile(profile) {
  let currentUserId = null;
  try {
    const { supabase, user } = await getAuthUser();
    currentUserId = user.id;

    if (process.env.ENABLE_D1_PROFILE === "true") {
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const repo = new ProfileRepository(adapter);
      return await repo.upsertProfile(user.id, profile);
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const { data, error } = await client
      .rpc("save_user_profile", {
        p_goal: profile.goal,
        p_weight: profile.weight,
        p_height: profile.height,
        p_age: profile.age,
        p_diet_type: profile.diet_type,
        p_level: profile.level,
        p_gender: profile.gender,
        p_unit_system: profile.unit_system,
      })
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) throw error;
    logger.error("SAVE_USER_PROFILE_FAILED", safeErrorDetails(error, "saveUserProfile", currentUserId));
    throw error;
  }
}
