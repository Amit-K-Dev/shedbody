import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addXP } from "@/lib/gamification/addXP";

export async function POST(req) {
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

    // Safe Body Parsing & Validation
    const XP_BY_ACTION = {
      weight_logged: 10,
      workout_completed: 25,
    };

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { action } = body;
    const amount = XP_BY_ACTION[action];

    if (!amount) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 },
      );
    }

    // Update XP in Database
    const result = await addXP(user.id, amount);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 },
      );
    }

    // Success Return
    return NextResponse.json(
      { success: true, xp: result.xp, level: result.level },
      { status: 200 },
    );
  } catch (error) {
    console.error("XP API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
