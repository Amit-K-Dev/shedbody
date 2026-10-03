import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ProgressRepository } from "@/lib/repositories/ProgressRepository";

export async function POST(req) {
  try {
    const supabase = await createClient();

    // Auth Check: Ensure user is actually logged in
    let user = null;
    let authHeaderToken = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authHeaderToken = authHeader.substring(7);
      const { data: authData } = await supabase.auth.getUser(authHeaderToken);
      if (authData?.user) user = authData.user;
    }

    if (!user) {
      const { data: cookieData } = await supabase.auth.getUser();
      user = cookieData?.user;
    }

    if (!user) {
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

    // CREATE CUSTOM DB CLIENT
    // Note: We use the admin client here because the 'authenticated' role
    // currently lacks INSERT/UPDATE table grants on 'progress_entries'.
    // The previous implementation used a SECURITY DEFINER RPC to bypass this.
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const customDbClient = createAdminClient();

    let dbError = null;
    let upsertResult = null;
    try {
      upsertResult = await ProgressRepository.upsertProgressEntry(user.id, {
        weight: weightValue,
        entryDate: entryDate,
        bodyFat: p_body_fat,
        notes: p_notes,
      }, customDbClient);
    } catch (e) {
      dbError = e;
    }

    // Database Error Handling
    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save weight entry." },
        { status: 500 },
      );
    }

    if (upsertResult?.action === 'insert') {
      // Best-effort gamification
      try {
        const { GamificationRepository } = await import("@/lib/repositories/GamificationRepository");
        await GamificationRepository.addUserXp(user.id, 10, customDbClient);
        await GamificationRepository.updateUserStreak(user.id, customDbClient);
      } catch (gamificationError) {
        console.error("Gamification Error:", gamificationError);
        // We DO NOT fail the request. Swallowing the error here makes it best-effort.
      }
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
