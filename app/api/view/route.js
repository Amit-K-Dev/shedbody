import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req) {
  if (process.env.NODE_ENV === "production" && !process.env.VIEW_HASH_SECRET) {
    console.error("Missing VIEW_HASH_SECRET");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const postId = Number(body?.postId);

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .or(
      "status.eq.published,status.eq.Published,status.eq.publish,status.is.null",
    )
    .not("published_at", "is", null)
    .maybeSingle();

  if (postError) {
    console.error("View API post lookup error:", postError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip =
    forwardedFor.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const userHash = crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}:${process.env.VIEW_HASH_SECRET || "local-dev"}`)
    .digest("hex");

  try {
    // 30 minuts window
    const viewedAt = new Date();
    const THIRTY_MIN_AGO = new Date(
      viewedAt.getTime() - 30 * 60 * 1000,
    ).toISOString();

    // Check recent view
    const { data: existing, error: existingError } = await supabase
      .from("post_views")
      .select("id")
      .eq("post_id", postId)
      .eq("user_hash", userHash)
      .gte("viewed_at", THIRTY_MIN_AGO)
      .limit(1);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "Already counted" });
    }

    // Insert view record
    const { error: insertError } = await supabase.from("post_views").insert({
      post_id: postId,
      user_hash: userHash,
      viewed_at: viewedAt.toISOString(),
    });

    if (insertError) throw insertError;

    // Increment actual views
    const { error: rpcError } = await supabase.rpc("increment_views", {
      post_id: postId,
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("View API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
