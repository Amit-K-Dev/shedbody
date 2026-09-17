import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        { status: 401 },
      );
    }

    // Parse Request Body safely
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const weightValue = parseFloat(body.weight);

    // Input Validation: Check if weight is valid
    if (
      !body.weight ||
      isNaN(weightValue) ||
      weightValue <= 0 ||
      weightValue > 500
    ) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid weight number." },
        { status: 400 },
      );
    }

    // Optional Fields parsing
    let p_body_fat = null;
    if (body.body_fat !== undefined && body.body_fat !== null) {
      p_body_fat = parseFloat(body.body_fat);
      if (isNaN(p_body_fat) || p_body_fat < 0 || p_body_fat > 100) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid body fat percentage." },
          { status: 400 },
        );
      }
    }

    let p_notes = null;
    if (body.notes !== undefined && body.notes !== null) {
      p_notes = String(body.notes).trim();
    }

    const entryDate = new Date().toISOString().slice(0, 10);

    // Database Insert
    const { error: dbError } = await supabase.rpc("upsert_progress_entry", {
      p_weight: weightValue,
      p_entry_date: entryDate,
      p_body_fat: p_body_fat,
      p_notes: p_notes,
    });

    // Database Error Handling
    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save weight entry." },
        { status: 500 },
      );
    }

    // Success
    return NextResponse.json(
      { success: true, message: "Weight added successfully!" },
      { status: 200 },
    );
  } catch (error) {
    // Catch any unexpected server crashes
    console.error("Progress API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 },
    );
  }
}
