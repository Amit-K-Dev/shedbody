import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_BODY_BYTES = 2048;
const MAX_NOTE_LENGTH = 280;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 8;
const ALLOWED_VOTES = new Set(["yes", "no"]);
const ALLOWED_REASONS = new Set([
  "clear",
  "actionable",
  "evidence",
  "complete",
  "unclear",
  "missing_detail",
  "outdated",
  "hard_to_follow",
]);

const feedbackRateLimit = globalThis.__shedbodyFeedbackRateLimit || new Map();
globalThis.__shedbodyFeedbackRateLimit = feedbackRateLimit;

function getClientIdentity(req) {
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const ip =
    forwardedFor.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  return { ip, userAgent };
}

function hashIdentity({ ip, userAgent }, secret) {
  return crypto
    .createHmac("sha256", secret || "local-dev")
    .update(`${ip}:${userAgent}`)
    .digest("hex");
}

function normalizeNote(note) {
  if (typeof note !== "string") return null;

  const cleaned = note
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NOTE_LENGTH);

  return cleaned || null;
}

function isSameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");

    return originUrl.host === host || originUrl.host === "shedbody.com";
  } catch {
    return false;
  }
}

function isRateLimited(userHash) {
  const now = Date.now();
  const bucket = feedbackRateLimit.get(userHash) || {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW_MS,
  };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  feedbackRateLimit.set(userHash, bucket);

  return bucket.count > RATE_LIMIT_MAX;
}

export async function POST(req) {
  const hashSecret =
    process.env.FEEDBACK_HASH_SECRET || process.env.VIEW_HASH_SECRET;

  if (process.env.NODE_ENV === "production" && !hashSecret) {
    console.error("Missing FEEDBACK_HASH_SECRET or VIEW_HASH_SECRET");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported media type" },
      { status: 415 },
    );
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const body = await req.json().catch(() => null);
  const postId = Number(body?.postId);
  const vote = body?.vote;
  const reason = typeof body?.reason === "string" ? body.reason : null;
  const note = normalizeNote(body?.note);

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }

  if (!ALLOWED_VOTES.has(vote)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  if (reason && !ALLOWED_REASONS.has(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const userHash = hashIdentity(getClientIdentity(req), hashSecret);

  if (isRateLimited(userHash)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("record_article_feedback", {
    target_post_id: postId,
    target_user_hash: userHash,
    target_vote: vote,
    target_reason: reason,
    target_note: note,
  });

  if (error) {
    console.error("Article feedback API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true, feedback: data?.[0] || null });
}
