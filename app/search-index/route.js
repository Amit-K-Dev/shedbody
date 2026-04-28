import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, title, slug, category, excerpt, keywords, status, published_at, updated_at, views",
      )
      .or(
        "status.eq.published,status.eq.Published,status.eq.publish,status.is.null",
      )
      .not("title", "is", null)
      .not("slug", "is", null)
      .not("category", "is", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch search index." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 },
    );
  }
}
