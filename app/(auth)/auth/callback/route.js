import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {}
          },
        },
      },
    );

    const { data: authData, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error && authData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const targetPath = profile?.role === "admin" ? "/admin" : "/dashboard";

      return NextResponse.redirect(`${origin}${targetPath}`);
    } else {
      console.error("🔴 SUPABASE AUTH ERROR:", error?.message);
    }
  } else {
    console.error("🔴 ERROR: 'code' parameter is missing in URL!");
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
