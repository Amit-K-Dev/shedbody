import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidCalendarDate } from "@/lib/utils/dateValidator";

export async function POST(req) {
  try {
    const supabase = await createClient();

    // Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse Request Body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { logDate, workoutCompleted, stepsCount, sleepHours } = body;

    // Strict Date Validation
    if (!isValidCalendarDate(logDate)) {
      return NextResponse.json(
        { success: false, error: "Valid logDate in YYYY-MM-DD format is required." },
        { status: 400 }
      );
    }

    // Workout Validation: Must be true, false, or null
    let parsedWorkout = null;
    if (workoutCompleted === true || workoutCompleted === false) {
      parsedWorkout = workoutCompleted;
    } else if (workoutCompleted !== null && workoutCompleted !== undefined) {
      return NextResponse.json(
        { success: false, error: "workoutCompleted must be true, false, or null." },
        { status: 400 }
      );
    }

    // Numeric Validation Helper
    const parseNumber = (val, min, max, isInteger) => {
      if (val === undefined || val === null || val === "") return null;
      const parsed = Number(val);
      if (isNaN(parsed) || !Number.isFinite(parsed)) return "INVALID";
      if (parsed < min || parsed > max) return "INVALID";
      if (isInteger && !Number.isInteger(parsed)) return "INVALID";
      return parsed;
    };

    // Enforce limits: steps 0-100k, sleep 0-24
    const parsedSteps = parseNumber(stepsCount, 0, 100000, true);
    const parsedSleep = parseNumber(sleepHours, 0, 24, false);

    if (parsedSteps === "INVALID") {
      return NextResponse.json(
        { success: false, error: "stepsCount must be an integer between 0 and 100000, or empty." },
        { status: 400 }
      );
    }

    if (parsedSleep === "INVALID") {
      return NextResponse.json(
        { success: false, error: "sleepHours must be a number between 0 and 24, or empty." },
        { status: 400 }
      );
    }

    // RPC Invocation
    const { error: dbError } = await supabase.rpc("upsert_lifestyle_log", {
      p_log_date: logDate,
      p_workout_completed: parsedWorkout,
      p_steps_count: parsedSteps,
      p_sleep_hours: parsedSleep,
    });

    if (dbError) {
      console.error("Supabase RPC Error (upsert_lifestyle_log):", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save lifestyle log." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Lifestyle logged successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lifestyle API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
