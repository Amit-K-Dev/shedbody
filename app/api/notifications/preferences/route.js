import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        ...safeUpdates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
