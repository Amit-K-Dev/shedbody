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
    const body = await req.json();
    const weightValue = parseFloat(body.weight);

    // Input Validation: Check if weight is valid
    if (!body.weight || isNaN(weightValue)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid weight number." },
        { status: 400 },
      );
    }

    // Database Insert
    const { error: dbError } = await supabase.from("progress_entries").insert([
      {
        user_id: user.id,
        weight: weightValue,
      },
    ]);

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
