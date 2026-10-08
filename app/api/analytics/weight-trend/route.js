import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "internal-python-secret-key-123";
const PYTHON_API_URL = process.env.PYTHON_ANALYTICS_URL;

export async function GET(req) {
  try {
    const supabase = await createClient();
    
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
