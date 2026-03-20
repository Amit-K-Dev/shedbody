import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    // Create simple user fingerprint
    const ip =
      req.headers.get("x-forwarded-for") ||
      reg.headers.get("x-real-ip") ||
      "unknown";

    const userHash = `${ip}-${req.headers.get("user-agent")}`;

    // 30 minuts window
    const THIRTY_MIN_AGO = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Check recent view
    const { data: existing } = await supabase
      .from("post_views")
      .select("id")
      .eq("post_id", postId)
      .eq("user_hash", userHash)
      .gte("viewed_at", THIRTY_MIN_AGO)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "Already counted" });
    }

    // Insert view record
    await supabase.from("post_views").insert({
      post_id: postId,
      user_hash: userHash,
    });

    // Increment actual views
    await supabase.rpc("increment_views", {
      post_id: postId,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("View API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
