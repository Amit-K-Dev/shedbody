import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateStreak } from "@/lib/streak/updateStreak";

export async function POST() {
  try {
    const supabase = await createClient();

    // Secure User Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Update Streak in Database
    const streak = await updateStreak(user.id);

    // Success Return
    return NextResponse.json(
      { success: true, streak: streak },
      { status: 200 },
    );
  } catch (error) {
    console.error("Streak API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
