import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";
import { isValidCalendarDate } from "@/lib/utils/dateValidator";

export async function POST(req) {
  try {
    const user = await getUser();

    if (!user) {
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

    const { logDate, habitName, completed } = body;

    // Strict Date Validation
    if (!isValidCalendarDate(logDate)) {
      return NextResponse.json(
        { success: false, error: "Valid logDate in YYYY-MM-DD format is required." },
        { status: 400 }
      );
    }

    // Habit Validation
    const allowedHabits = ['workout', 'steps', 'water', 'sleep', 'protein', 'meditation'];
    if (!allowedHabits.includes(habitName)) {
      return NextResponse.json(
        { success: false, error: "Invalid habit name." },
        { status: 400 }
      );
    }

    if (typeof completed !== "boolean") {
      return NextResponse.json(
        { success: false, error: "completed must be a boolean." },
        { status: 400 }
      );
    }

    // Repository Invocation
    try {
      const { HabitRepository } = await import("@/lib/repositories/HabitRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const habitRepo = new HabitRepository(adapter);
      await habitRepo.upsertHabitEntry(user.id, habitName, logDate, completed);
    } catch (d1Error) {
      console.warn("D1 HabitRepository fallback to Supabase:", d1Error?.message || d1Error);
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { error: dbError } = await supabase.rpc("upsert_habit_entry", {
          p_habit_name: habitName,
          p_log_date: logDate,
          p_completed: completed,
        });

        if (dbError) {
          console.error("Supabase RPC Error (upsert_habit_entry):", dbError);
          return NextResponse.json(
            { success: false, error: "Failed to save habit entry." },
            { status: 500 }
          );
        }
      } catch (fallbackError) {
        console.error("Habit Fallback Error:", fallbackError);
        return NextResponse.json(
          { success: false, error: "Failed to save habit entry." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, message: "Habit logged successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Habit API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
