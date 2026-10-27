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

    const { logDate, workoutCompleted, stepsCount, sleepHours } = body;

    // Strict Date Validation
    if (!isValidCalendarDate(logDate)) {
      return NextResponse.json(
        { success: false, error: "Valid logDate in YYYY-MM-DD format is required." },
        { status: 400 }
      );
    }

    // Workout Validation: Must be true, false, undefined (omitted), or null (clear)
    let parsedWorkout = workoutCompleted;
    if (parsedWorkout !== undefined && parsedWorkout !== null && parsedWorkout !== true && parsedWorkout !== false) {
      return NextResponse.json(
        { success: false, error: "workoutCompleted must be true, false, undefined, or null." },
        { status: 400 }
      );
    }

    // Numeric Validation Helper (undefined means omitted, null means explicit clear)
    const parseNumber = (val, min, max, isInteger) => {
      if (val === undefined) return undefined; // Omitted
      if (val === null || val === "") return null; // Explicit clear
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

    // Build sparse payload
    const payload = {};
    if (parsedWorkout !== undefined) payload.workout = parsedWorkout;
    if (parsedSteps !== undefined) payload.steps = parsedSteps;
    if (parsedSleep !== undefined) payload.sleep = parsedSleep;

    // Database Insert via MetricWriteAdapter or MetricRepository
    try {
      const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
      const { LifestyleRepository } = await import("@/lib/repositories/LifestyleRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const metricRepo = new MetricRepository(adapter);
      const lifestyleRepo = new LifestyleRepository(adapter);

      const metricStmts = await metricRepo.getCommitStatements(user.id, logDate, payload, 'manual');
      const lifestyleStmt = await lifestyleRepo.getUpsertStatement(
        user.id, 
        logDate, 
        parsedWorkout !== undefined ? parsedWorkout : null,
        parsedSteps !== undefined ? parsedSteps : null,
        parsedSleep !== undefined ? parsedSleep : null
      );

      // Atomic Batch
      await adapter.batch([...metricStmts, lifestyleStmt]);
    } catch (d1Error) {
      console.warn("D1 Metric/LifestyleRepository fallback to Supabase:", d1Error?.message || d1Error);
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { MetricWriteAdapter } = await import("@/lib/repositories/MetricWriteAdapter.js");
        const { error: dbError } = await MetricWriteAdapter.commit(
          { supabase, userId: user.id, logDate },
          payload,
          'manual'
        );

        if (dbError) {
          console.error("MetricWriteAdapter Error (lifestyle):", dbError);
          return NextResponse.json(
            { success: false, error: "Failed to save lifestyle log." },
            { status: 500 }
          );
        }
      } catch (fallbackError) {
        console.error("Lifestyle Fallback Error:", fallbackError);
        return NextResponse.json(
          { success: false, error: "Failed to save lifestyle log." },
          { status: 500 }
        );
      }
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
