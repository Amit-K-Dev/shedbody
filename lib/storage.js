"use server";

import { createClient } from "@/lib/supabase/server";

// Helper function to get secure user
async function getAuthUser() {
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

export async function getPlans() {
  try {
    const { supabase, user } = await getAuthUser();

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("user_id", user.id)
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
    const { supabase, user } = await getAuthUser();
    const { dietType, ...rest } = plan;

    // SAVE THE PLAN
    const { data: savedPlan, error: planError } = await supabase
      .from("plans")
      .insert([{ ...rest, diet_type: dietType, user_id: user.id }])
      .select()
      .single();

    if (planError) throw planError;

    if (plan.goal) {
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from("user_profiles")
          .update({ goal: plan.goal })
          .eq("user_id", user.id);
      } else {
        // Create new profile with this goal
        await supabase.from("user_profiles").insert([
          {
            user_id: user.id,
            goal: plan.goal,
            target_weight: 0,
            xp: 0,
            gamification_level: 1,
            streak_count: 1,
          },
        ]);
      }
    }

    return savedPlan;
  } catch (error) {
    console.error("Save plan error:", error);
    throw new Error(error.message || "Failed to save plan");
  }
}

export async function deletePlan(id) {
  try {
    const { supabase, user } = await getAuthUser();
    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
}

export async function clearAllPlans() {
  try {
    const { supabase, user } = await getAuthUser();
    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("user_id", user.id);
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
      .select("*")
      .eq("user_id", user.id)
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
    const { data, error } = await supabase
      .from("progress_entries")
      .insert([{ ...entry, user_id: user.id }])
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
    const { supabase, user } = await getAuthUser();
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({ ...profile, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}
