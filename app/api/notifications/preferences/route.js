import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function PATCH(request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await request.json();
    
    // We expect the shape to match our preferences schema
    // workout_reminders, goal_reminders, habit_reminders, weekly_progress, plan_updates
    
    // Validate only allowed keys
    const allowedKeys = ['workout_reminders', 'goal_reminders', 'habit_reminders', 'weekly_progress', 'plan_updates'];
    const safeUpdates = {};
    for (const key of allowedKeys) {
      if (typeof updates[key] === 'boolean') {
        safeUpdates[key] = updates[key];
      }
    }
    
    // Upsert preference
    const isD1NotificationsEnabled = process.env.ENABLE_D1_NOTIFICATIONS === "true";
    let d1Updated = false;

    if (isD1NotificationsEnabled) {
      try {
        const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const adapter = new D1Adapter();
        adapter._checkDb();
        const profileRepo = new ProfileRepository(adapter);
        await profileRepo.updatePreferences(user.id, safeUpdates);
        d1Updated = true;
      } catch (d1Err) {
        console.warn("ProfileRepository D1 updatePreferences error, falling back to Supabase:", d1Err?.message || d1Err);
      }
    }

    if (!d1Updated) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { error: upsertError } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...safeUpdates, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

      if (upsertError) {
        console.error("Supabase notification_preferences upsert error:", upsertError);
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
