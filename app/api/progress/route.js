import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function POST(req) {
  try {
    let user = await getUser();

    // Check optional Bearer token if not resolved by cookie/session
    if (!user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const { createClient } = await import("@/lib/supabase/server");
          const supabase = await createClient();
          const { data: authData } = await supabase.auth.getUser(authHeader.substring(7));
          if (authData?.user) user = authData.user;
        } catch {}
      }
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

    let dbError = null;
    let upsertResult = null;

    try {
      const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const metricRepo = new MetricRepository(adapter);

      await metricRepo.commit(user.id, entryDate, {
        weight: weightValue,
        body_fat: p_body_fat
      }, 'manual');
      upsertResult = { action: 'insert' };
    } catch (d1Error) {
      console.warn("D1 MetricRepository fallback to Supabase (progress):", d1Error?.message || d1Error);
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const customDbClient = createAdminClient();
        const { ProgressRepository } = await import("@/lib/repositories/ProgressRepository");

        upsertResult = await ProgressRepository.upsertProgressEntry(user.id, {
          weight: weightValue,
          entryDate: entryDate,
          bodyFat: p_body_fat,
          notes: p_notes,
        }, customDbClient);
      } catch (e) {
        dbError = e;
      }
    }

    // Database Error Handling
    if (dbError) {
      console.error("Progress Insert Error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save weight entry." },
        { status: 500 },
      );
    }

    if (upsertResult?.action === 'insert') {
      // Best-effort gamification
      try {
        const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const adapter = new D1Adapter();
        adapter._checkDb();
        const profileRepo = new ProfileRepository(adapter);

        await profileRepo.addXP(user.id, 10);
        await profileRepo.processStreak(user.id);
      } catch (gamificationD1Error) {
        try {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const customDbClient = createAdminClient();
          const { GamificationRepository } = await import("@/lib/repositories/GamificationRepository");
          await GamificationRepository.addUserXp(user.id, 10, customDbClient);
          await GamificationRepository.updateUserStreak(user.id, customDbClient);
        } catch (gamificationError) {
          console.error("Gamification Error:", gamificationError);
          // We DO NOT fail the request. Swallowing the error here makes it best-effort.
        }
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
