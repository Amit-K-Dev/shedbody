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

// ==========================================
// PLANS SECTION
// ==========================================

export async function getPlans(authContext) {
  try {
    const { supabase, user } = await getAuthUser(authContext);

    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export async function savePlan(plan) {
  try {
    const { supabase } = await getAuthUser();
    const { dietType, ...rest } = plan;

    const { data: savedPlan, error } = await supabase
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
    console.error("Save plan error:", error);
    throw new Error(error.message || "Failed to save plan");
  }
}

export async function deletePlan(id) {
  try {
    const { supabase } = await getAuthUser();
    const { error } = await supabase.rpc("soft_delete_plan", { p_id: id });
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
}

export async function clearAllPlans() {
  try {
    const { supabase } = await getAuthUser();
    const { error } = await supabase.rpc("clear_all_plans");
    if (error) throw error;
  } catch (error) {
    console.error("Error clearing plans:", error);
    throw error;
  }
}

// ==========================================
// PROGRESS SECTION
// ==========================================

export async function getProgress() {
  try {
    const { supabase, user } = await getAuthUser();
    const { data, error } = await supabase
      .from("progress_entries")
      .select("id, weight, body_fat, notes, entry_date, created_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("entry_date", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting progress:", error);
    return [];
  }
}

export async function addProgressEntry(entry) {
  try {
    const { supabase, user } = await getAuthUser();
    const entryDate = entry.entry_date || new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("progress_entries")
      .insert([
        {
          ...entry,
          user_id: user.id,
          entry_date: entryDate,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding progress entry:", error);
    return null;
  }
}

// ==========================================
// USER PROFILE SECTION
// ==========================================

export async function getUserProfile() {
  try {
    const { supabase, user } = await getAuthUser();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
}

export async function saveUserProfile(profile) {
  try {
    const { supabase } = await getAuthUser();

    const { data, error } = await supabase
      .rpc("save_user_profile", {
        p_goal: profile.goal,
        p_target_weight: profile.target_weight,
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
    console.error("Error saving user profile:", error);
    throw error;
  }
}
