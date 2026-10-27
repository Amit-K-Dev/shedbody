import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function POST(req) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { calculatorId, inputData, resultData } = body;

    if (!calculatorId || !inputData || !resultData) {
      return NextResponse.json(
        { success: false, error: "calculatorId, inputData, and resultData are required." },
        { status: 400 }
      );
    }

    try {
      const { CalculatorRepository } = await import("@/lib/repositories/CalculatorRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const calculatorRepo = new CalculatorRepository(adapter);
      await calculatorRepo.upsertCalculatorResult(user.id, calculatorId, inputData, resultData);
      return NextResponse.json({ success: true, message: "Result saved successfully" }, { status: 200 });
    } catch (d1Error) {
      console.warn("D1 CalculatorRepository fallback to Supabase:", d1Error?.message || d1Error);
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { error: dbError } = await supabase.rpc("upsert_calculator_result", {
          p_calculator_id: calculatorId,
          p_input_data: inputData,
          p_result_data: resultData,
        });

        if (dbError) {
          console.error("Supabase RPC Error (upsert_calculator_result):", dbError);
          return NextResponse.json(
            { success: false, error: "Failed to save calculator result." },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, message: "Result saved successfully" }, { status: 200 });
      } catch (fallbackError) {
        console.error("Calculator Save Fallback Error:", fallbackError);
        return NextResponse.json(
          { success: false, error: "Failed to save calculator result." },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Calculator Save API Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
