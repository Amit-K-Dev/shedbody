import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isValidCalendarDate(dateString) {
  if (!dateString || typeof dateString !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const [year, month, day] = dateString.split("-").map(Number);
  if (month < 1 || month > 12) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Leap year check
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }
  
  return day > 0 && day <= daysInMonth[month - 1];
}

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

    // Parse and validate numeric fields (null or finite non-negative)
    const parseNumber = (val) => {
      if (val === undefined || val === null || val === "") return null;
      const parsed = Number(val);
      if (isNaN(parsed) || !Number.isFinite(parsed) || parsed < 0) {
        return "INVALID";
      }
      return parsed;
    };

    const parsedCalories = parseNumber(calories);
    const parsedProtein = parseNumber(protein);
    const parsedWater = parseNumber(water);

    if (parsedCalories === "INVALID" || parsedProtein === "INVALID" || parsedWater === "INVALID") {
      return NextResponse.json(
        { success: false, error: "Calories, protein, and water must be positive numbers or empty." },
        { status: 400 }
      );
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
