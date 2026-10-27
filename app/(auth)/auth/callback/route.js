import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";
import { getHeaderProfile } from "@/lib/actions/profile.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const error = searchParams.get("error");

  // Propagate incoming error parameters directly to login UI
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  // Resolve session via Better Auth
  try {
    const user = await getUser();
    if (user) {
      const profile = await getHeaderProfile(user.id);
      const targetPath = profile?.role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(`${origin}${targetPath}`);
    }
  } catch (err) {
    console.error("[Callback] Better Auth session resolution error:", err?.message || err);
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
