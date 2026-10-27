import { NextResponse } from "next/server";
import { safeTimingCompare } from "@/lib/auth/edgeJwtVerifier.js";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (!internalSecret || !authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized Internal Request" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    if (!safeTimingCompare(token, internalSecret)) {
      return NextResponse.json({ error: "Unauthorized Internal Request" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    let startDate = searchParams.get("start_date");
    let endDate = searchParams.get("end_date");

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }

    // Default to 30 days if not provided
    if (!endDate) {
      endDate = new Date().toISOString().slice(0, 10);
    }
    if (!startDate) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    }
    
    // Validate date format (simple length check, can be expanded)
    if (startDate > endDate) {
      return NextResponse.json({ error: "start_date cannot be after end_date" }, { status: 400 });
    }

    let entries = [];

    try {
      const { MetricRepository } = await import("@/lib/repositories/MetricRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const metricRepo = new MetricRepository(adapter);
      
      entries = await metricRepo.getProgress(userId, { 
        startDate: startDate, 
        endDate: endDate, 
        orderAsc: true 
      }) || [];
    } catch (d1Error) {
      console.warn("D1 MetricRepository fallback to Supabase (internal/metrics):", d1Error?.message || d1Error);
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const { MetricReadAdapter } = await import("@/lib/repositories/MetricReadAdapter");
        const supabase = await createClient();

        entries = await MetricReadAdapter.getProgress(
          { supabase, userId },
          { 
            startDate: startDate, 
            endDate: endDate, 
            orderAsc: true 
          }
        ) || [];
      } catch (e) {
        if (e.code === '22P02' || e.message?.includes('invalid input syntax for type uuid')) {
          return NextResponse.json(
            { error: "Identity format mismatch: Supabase requires UUID but received string." },
            { status: 400 }
          );
        } else {
          console.error("Supabase MetricRead Error:", e);
          return NextResponse.json({ error: "Database failure" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ data: entries }, { status: 200 });

  } catch (error) {
    console.error("Internal Metrics API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
