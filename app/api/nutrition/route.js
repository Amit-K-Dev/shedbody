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

    // Parse Request Body safely
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    // Extract values
    const { logDate, calories, protein, water } = body;

    // Strict validation for logDate (YYYY-MM-DD) calendar correctness
    if (!isValidCalendarDate(logDate)) {
      return NextResponse.json(
        { success: false, error: "Valid logDate in YYYY-MM-DD format is required." },
        { status: 400 }
      );
    }

    // Parse and validate numeric fields (undefined means omitted, null means explicit clear)
    const parseNumber = (val) => {
      if (val === undefined) return undefined; // Omitted
      if (val === null || val === "") return null; // Explicit clear
      const parsed = Number(val);
      if (isNaN(parsed) || !Number.isFinite(parsed) || parsed < 0) {
        return "INVALID";
      }
      return parsed;
    };

    const parsedCalories = parseNumber(body.calories);
    const parsedProtein = parseNumber(body.protein);
    const parsedWater = parseNumber(body.water);

    if (parsedCalories === "INVALID" || parsedProtein === "INVALID" || parsedWater === "INVALID") {
      return NextResponse.json(
        { success: false, error: "Calories, protein, and water must be positive numbers or empty." },
        { status: 400 }
      );
    }

    // Build sparse payload
    const payload = {};
    if (parsedCalories !== undefined) payload.calories = parsedCalories;
    if (parsedProtein !== undefined) payload.protein = parsedProtein;
    if (parsedWater !== undefined) payload.water = parsedWater;

    // Database Insert via MetricRepository/NutritionRepository with Supabase fallback
    try {
      const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
      const { NutritionRepository } = await import("@/lib/repositories/NutritionRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const metricRepo = new MetricRepository(adapter);
      const nutritionRepo = new NutritionRepository(adapter);

      const metricStmts = await metricRepo.getCommitStatements(user.id, logDate, payload, 'manual');
      const nutritionStmt = await nutritionRepo.getUpsertStatement(
        user.id, 
        logDate, 
        parsedCalories !== undefined ? parsedCalories : null,
        parsedProtein !== undefined ? parsedProtein : null,
        parsedWater !== undefined ? parsedWater : null
      );

      // Atomic Batch
      await adapter.batch([...metricStmts, nutritionStmt]);
    } catch (d1Error) {
      console.warn("D1 Metric/NutritionRepository fallback to Supabase:", d1Error?.message || d1Error);
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
          console.error("MetricWriteAdapter Error (nutrition):", dbError);
          return NextResponse.json(
            { success: false, error: "Failed to save nutrition log." },
            { status: 500 }
          );
        }
      } catch (fallbackError) {
        console.error("Nutrition Fallback Error:", fallbackError);
        return NextResponse.json(
          { success: false, error: "Failed to save nutrition log." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, message: "Nutrition logged successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Nutrition API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
