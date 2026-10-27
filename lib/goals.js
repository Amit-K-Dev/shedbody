"use server";

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

/**
 * Sets a new weight goal using GoalRepository in D1 when ENABLE_D1_GOALS === "true".
 * Fails closed on any D1 error or missing binding without automatic Supabase write fallback.
 * When ENABLE_D1_GOALS !== "true", executes existing Supabase RPC.
 */
export async function setWeightGoal(targetValue, authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    // Gated D1 Bridge execution: Requires explicit ENABLE_D1_BRIDGE === "true"
    if (process.env.ENABLE_D1_BRIDGE === "true") {
      const { D1BridgeClient } = await import("@/lib/api/d1BridgeClient.js");
      const client = new D1BridgeClient();
      let token = authContext?.accessToken;
      if (!token && supabase?.auth?.getSession) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token;
      }
      return await client.createWeightGoal(token, targetValue);
    }

    // Gated D1 execution: Requires explicit ENABLE_D1_GOALS === "true"
    if (process.env.ENABLE_D1_GOALS === "true") {
      const { GoalRepository } = await import("@/lib/repositories/GoalRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const repo = new GoalRepository(adapter);
      return await repo.createWeightGoal(user.id, targetValue);
    }

    const { createClient } = await import("@/lib/supabase/server");
    const client = supabase || (await createClient());
    const { data, error } = await client
      .rpc("create_weight_goal", {
        p_target_value: targetValue,
      })
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) {
      throw error;
    }
    logger.error("SET_WEIGHT_GOAL_FAILED", safeErrorDetails(error, "setWeightGoal", currentUserId));
    throw error;
  }
}

/**
 * Gets the active goal for a specific domain.
 */
export async function getActiveGoal(domain = "weight", authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  const safeDomain = typeof domain === "string" && domain.length < 30 ? domain : "weight";
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    // Gated D1 Bridge execution: Requires explicit ENABLE_D1_BRIDGE === "true"
    if (process.env.ENABLE_D1_BRIDGE === "true") {
      try {
        const { D1BridgeClient } = await import("@/lib/api/d1BridgeClient.js");
        const client = new D1BridgeClient();
        let token = authContext?.accessToken;
        if (!token && supabase?.auth?.getSession) {
          const { data } = await supabase.auth.getSession();
          token = data?.session?.access_token;
        }
        const goal = await client.getActiveGoal(token, domain);
        if (goal) {
          return goal;
        }
      } catch (bridgeError) {
        logger.warn("D1_BRIDGE_READ_FALLBACK", {
          ...safeErrorDetails(bridgeError, "getActiveGoal", currentUserId),
          domain: safeDomain,
        });
      }
    }

    // Gated D1 execution: Requires explicit ENABLE_D1_GOALS === "true"
    if (process.env.ENABLE_D1_GOALS === "true") {
      try {
        const { GoalRepository } = await import("@/lib/repositories/GoalRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const adapter = new D1Adapter();
        adapter._checkDb();
        const repo = new GoalRepository(adapter);
        const goal = await repo.getActiveGoal(user.id, domain);
        if (goal) {
          return goal;
        }
      } catch (d1Error) {
        logger.warn("D1_READ_FALLBACK", {
          ...safeErrorDetails(d1Error, "getActiveGoal", currentUserId),
          domain: safeDomain,
        });
        // Fallback to Supabase below
      }
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import("@/lib/supabase/server");
      const client = supabase || (await createClient());
      const { data, error } = await client
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("domain", domain)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    }

    return null;
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) {
      throw error;
    }
    logger.error("GET_ACTIVE_GOAL_FAILED", {
      ...safeErrorDetails(error, "getActiveGoal", currentUserId),
      domain: safeDomain,
    });
    return null;
  }
}

/**
 * Gets the goal history for a specific domain.
 */
export async function getGoalHistory(domain = "weight", authContext) {
  let currentUserId = authContext?.userId || authContext?.user?.id || null;
  const safeDomain = typeof domain === "string" && domain.length < 30 ? domain : "weight";
  try {
    const { supabase, user } = await getAuthUser(authContext);
    currentUserId = user.id;

    // Gated D1 execution: Requires explicit ENABLE_D1_GOALS === "true"
    if (process.env.ENABLE_D1_GOALS === "true") {
      try {
        const { GoalRepository } = await import("@/lib/repositories/GoalRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const adapter = new D1Adapter();
        adapter._checkDb();
        const repo = new GoalRepository(adapter);
        const history = await repo.getGoalHistory(user.id, domain);
        if (history && history.length > 0) {
          return history;
        }
      } catch (d1Error) {
        logger.warn("D1_READ_FALLBACK", {
          ...safeErrorDetails(d1Error, "getGoalHistory", currentUserId),
          domain: safeDomain,
        });
        // Fallback to Supabase below
      }
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import("@/lib/supabase/server");
      const client = supabase || (await createClient());
      const { data, error } = await client
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("domain", domain)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return [];
  } catch (error) {
    if (error.message?.includes("Cross-tenant")) {
      throw error;
    }
    logger.error("GET_GOAL_HISTORY_FAILED", {
      ...safeErrorDetails(error, "getGoalHistory", currentUserId),
      domain: safeDomain,
    });
    return [];
  }
}

/**
 * Calculates goal progress based on start value, target value, and current value.
 * Clamps the result between 0 and 100.
 * Handles weight loss, weight gain, and missing start values.
 */
export async function calculateGoalProgress(goal, currentValue) {
  if (!goal || currentValue === null || currentValue === undefined) return 0;
  if (goal.start_value === null || goal.start_value === undefined) return 0;
  
  const start = parseFloat(goal.start_value);
  const target = parseFloat(goal.target_value);
  const current = parseFloat(currentValue);

  if (isNaN(start) || isNaN(target) || isNaN(current)) return 0;
  
  // If start and target are the same, or user has already passed the target
  if (start === target) return 100;

  const totalChangeNeeded = target - start;
  const changeSoFar = current - start;

  // Calculate percentage
  let progress = (changeSoFar / totalChangeNeeded) * 100;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(progress)));
}
