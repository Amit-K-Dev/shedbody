"use server";

import { createClient } from "@/lib/supabase/server";

// Helper function to get secure user
async function getAuthUser(authContext) {
  if (authContext?.supabase && authContext?.user) {
    return authContext;
  }

  if (authContext?.supabase && authContext?.userId) {
    return {
      supabase: authContext.supabase,
      user: { id: authContext.userId },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized access");
  return { supabase, user };
}

/**
 * Sets a new weight goal using the create_weight_goal RPC.
 */
export async function setWeightGoal(targetValue, authContext) {
  try {
    const { supabase } = await getAuthUser(authContext);

    const { data, error } = await supabase
      .rpc("create_weight_goal", {
        p_target_value: targetValue,
      })
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error setting weight goal:", error);
    throw error;
  }
}

/**
 * Gets the active goal for a specific domain.
 */
export async function getActiveGoal(domain = "weight", authContext) {
  try {
    const { supabase, user } = await getAuthUser(authContext);

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("domain", domain)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error getting active ${domain} goal:`, error);
    return null;
  }
}

/**
 * Gets the goal history for a specific domain.
 */
export async function getGoalHistory(domain = "weight", authContext) {
  try {
    const { supabase, user } = await getAuthUser(authContext);

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("domain", domain)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error getting ${domain} goal history:`, error);
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
