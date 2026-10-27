import { NextResponse } from "next/server";

export async function GET() {
  try {
    try {
      const { PostRepository } = await import("@/lib/repositories/PostRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const postRepo = new PostRepository(adapter);
      
      const data = await postRepo.getPublishedPosts();
      return NextResponse.json(
        { success: true, data },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    } catch (d1Error) {
      console.warn("D1 Fetch Error (Posts) fallback to Supabase:", d1Error?.message || d1Error);
    }

    const { createClient } = await import("@/lib/supabase/server");
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

    // Database Error Handling
    if (error) {
      console.error("API Fetch Error (Posts):", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch posts data." },
        { status: 500 },
      );
    }

    // Success Response
    return NextResponse.json(
      { success: true, data: data || [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    // Server Crash Handling
    console.error("API Route Crash:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 },
    );
  }
}
