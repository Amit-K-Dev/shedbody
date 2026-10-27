import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;
const PYTHON_API_URL = process.env.PYTHON_ANALYTICS_URL;

export async function GET(req) {
  try {
    let user = await getUser();

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

    // Fallback for Better Auth proxy
    if (!user) {
      const xUserId = req.headers.get('x-user-id');
      if (xUserId) {
        user = { id: xUserId };
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Pass through query parameters securely
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const pythonParams = new URLSearchParams();
    pythonParams.append("user_id", user.id);
    if (startDate) pythonParams.append("start_date", startDate);
    if (endDate) pythonParams.append("end_date", endDate);

    if (!INTERNAL_SECRET || !PYTHON_API_URL) {
      console.error("Analytics Gateway configuration error: Missing INTERNAL_API_SECRET or PYTHON_ANALYTICS_URL.");
      return NextResponse.json(
        { success: false, error: "Analytics service is not properly configured." },
        { status: 503 }
      );
    }

    // Call Python Service
    const pythonResponse = await fetch(`${PYTHON_API_URL}/api/v1/analytics/weight-trend?${pythonParams.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${INTERNAL_SECRET}`,
        "Content-Type": "application/json"
      }
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      let errorMsg = "Analytics service failed.";
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.detail) errorMsg = parsed.detail;
      } catch (e) {}
      console.error("Python service error:", pythonResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: pythonResponse.status }
      );
    }

    const data = await pythonResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Analytics Gateway Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
