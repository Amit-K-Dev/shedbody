import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VIEW_HASH_SECRET =
  process.env.VIEW_HASH_SECRET ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "shedbody-view-hash-fallback";

export async function POST(req) {
  if (process.env.NODE_ENV === "production" && !process.env.VIEW_HASH_SECRET) {
    console.warn("VIEW_HASH_SECRET is missing; using fallback view hash salt.");
  }

  const body = await req.json().catch(() => null);
  const postId = Number(body?.postId);

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  const supabase = await createClient();

  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip =
    forwardedFor.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const userHash = crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}:${VIEW_HASH_SECRET}`)
    .digest("hex");

  try {
    const viewedAt = new Date();

    const { data, error } = await supabase.rpc("record_post_view", {
      target_post_id: postId,
      target_user_hash: userHash,
      target_viewed_at: viewedAt.toISOString(),
    });

    if (error) {
      if (error.code !== "PGRST202") throw error;

      const { error: fallbackError } = await supabase.rpc("increment_views", {
        post_id: postId,
      });

      if (fallbackError) throw fallbackError;

      const { data: post } = await supabase
        .from("posts")
        .select("views")
        .eq("id", postId)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        counted: true,
        fallback: true,
        views: Number(post?.views || 0),
      });
    }

    return NextResponse.json(data || { success: true });
  } catch (err) {
    console.error("View API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
