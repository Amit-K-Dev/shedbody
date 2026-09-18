import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidCalendarDate } from "@/lib/utils/dateValidator";

export async function POST(req) {
  try {
    const supabase = await createClient();

    // Auth Check: Ensure user is actually logged in
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

    let parsedCalories = parseNumber(body.calories);
    let parsedProtein = parseNumber(body.protein);
    let parsedWater = parseNumber(body.water);

    if (parsedCalories === "INVALID" || parsedProtein === "INVALID" || parsedWater === "INVALID") {
      return NextResponse.json(
        { success: false, error: "Calories, protein, and water must be positive numbers or empty." },
        { status: 400 }
      );
    }

    // Preserve existing values ONLY for genuinely omitted fields (undefined)
    if (parsedCalories === undefined || parsedProtein === undefined || parsedWater === undefined) {
      const { data: existingLog } = await supabase
        .from("nutrition_logs")
        .select("calories_consumed, protein_consumed, water_ml")
        .eq("user_id", user.id)
        .eq("log_date", logDate)
        .maybeSingle();

      if (existingLog) {
        if (parsedCalories === undefined) parsedCalories = existingLog.calories_consumed;
        if (parsedProtein === undefined) parsedProtein = existingLog.protein_consumed;
        if (parsedWater === undefined) parsedWater = existingLog.water_ml;
      } else {
        if (parsedCalories === undefined) parsedCalories = null;
        if (parsedProtein === undefined) parsedProtein = null;
        if (parsedWater === undefined) parsedWater = null;
      }
    }

    // Database Insert via RPC
    const { error: dbError } = await supabase.rpc("upsert_nutrition_log", {
      p_log_date: logDate,
      p_calories_consumed: parsedCalories,
      p_protein_consumed: parsedProtein,
      p_water_ml: parsedWater,
    });

    if (dbError) {
      console.error("Supabase RPC Error (upsert_nutrition_log):", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save nutrition log." },
        { status: 500 }
      );
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
