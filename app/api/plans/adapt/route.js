import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAndAdaptPlan } from "@/lib/plans/adaptationService";

export async function POST(req) {
  try {
    const supabase = await createClient();

    // 1. Authenticate Request
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
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

    // 2. Delegate to the orchestration service
    // We intentionally ignore client input for adaptation to prevent
    // users from overriding their deterministic history or targets.
    const result = await checkAndAdaptPlan({ supabase, user });

    // 3. Handle Persistence/Internal Errors
    if (!result.success && (result.reasonCode === "RPC_ERROR" || result.reasonCode === "UNEXPECTED_ERROR")) {
      console.error("Adaptation Service Error:", result);
      // Fail closed and hide internal details from client
      return NextResponse.json(
        { success: false, error: "An internal error occurred during adaptation." },
        { status: 500 }
      );
    }

    // 4. Return Deterministic State
    // Returns 200 OK for successful adaptation OR deterministic blocked states
    // (e.g. ON_TRACK, INSUFFICIENT_DATA, COOLDOWN_ACTIVE) which are not server errors.
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // 5. Catch-all for unexpected API crashes
    console.error("Adaptation API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
