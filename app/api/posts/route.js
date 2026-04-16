import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // 2. Data Fetching
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, title, slug, category, excerpt, published_at, updated_at, views",
      )
      .not("title", "is", null)
      .not("slug", "is", null)
      .not("category", "is", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    // 3. Database Error Handling
    if (error) {
      console.error("API Fetch Error (Posts):", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch posts data." },
        { status: 500 },
      );
    }

    // 4. Success Response
    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 },
    );
  } catch (err) {
    // 5. Server Crash Handling
    console.error("API Route Crash:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 },
    );
  }
}
