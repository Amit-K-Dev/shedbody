import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const calculatorId = searchParams.get("calculatorId");

    if (!calculatorId) {
      return NextResponse.json(
        { success: false, error: "calculatorId is required." },
        { status: 400 }
      );
    }

    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    try {
      const { CalculatorRepository } = await import("@/lib/repositories/CalculatorRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const calculatorRepo = new CalculatorRepository(adapter);
      const history = await calculatorRepo.getCalculatorHistory(user.id, calculatorId);
      return NextResponse.json({ success: true, data: history }, { status: 200 });
    } catch (d1Error) {
      console.warn("D1 CalculatorRepository getHistory fallback to Supabase:", d1Error?.message || d1Error);
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data, error: dbError } = await supabase
          .from("calculator_results")
          .select("id, result_data, input_data, is_latest, created_at")
          .eq("calculator_id", calculatorId)
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(7);

        if (dbError) {
          console.error("Supabase Error (fetchHistory):", dbError);
          return NextResponse.json(
            { success: false, error: "Failed to fetch calculator history." },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
      } catch (fallbackError) {
        console.error("Calculator History Fallback Error:", fallbackError);
        return NextResponse.json(
          { success: false, error: "Failed to fetch calculator history." },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Calculator History API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
