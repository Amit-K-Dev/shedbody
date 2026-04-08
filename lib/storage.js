"use server";

import { createClient } from "@/lib/supabase/server";

// ==========================================
// PLANS SECTION
// ==========================================

export async function getPlans() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching plans:", error);
    return [];
  }

  return data || [];
}

export async function savePlan(plan) {
  const supabase = await createClient();
  const { dietType, ...rest } = plan;

  const { data, error } = await supabase
    .from("plans")
    .insert([{ ...rest, diet_type: dietType }])
    .select()
    .single();

  if (error) {
    console.error("Save plan error:", error);
    throw new Error(error.message || "Failed to save plan");
  }

  return data;
}

export async function deletePlan(id) {
  const supabase = await createClient();

  const { error } = await supabase.from("plans").delete().eq("id", id);

  if (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
}

export async function clearAllPlans() {
  const supabase = await createClient();

  const { error } = await supabase.from("plans").delete().neq("id", "");

  if (error) {
    console.error("Error clearing plans:", error);
    throw error;
  }
}

// ==========================================
// PROGRESS SECTION
// ==========================================

export async function getProgress() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("progress_entries")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Error getting progress:", error);
    return [];
  }

  return data || [];
}

export async function addProgressEntry(entry) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("progress_entries")
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error("Error adding progress entry:", error);
    return null;
  }

  return data;
}

// ==========================================
// USER PROFILE SECTION
// ==========================================

export async function getUserProfile() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function saveUserProfile(profile) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(profile)
    .select()
    .single();

  if (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }

  return data;
}
