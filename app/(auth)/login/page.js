"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import GoogleIcon from "@/components/icons/GoogleIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import { Mail } from "lucide-react";
import Link from "next/link";

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [magicEmail, setMagicEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Magic Link Login
  const handleMagicLogin = async () => {
    setMsg("");
    setError();

    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) setError(error.message);
    else setMsg("Magic link sent! Check your email.");
  };

  // OAuth login
  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  // UI
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-center mb-8">Login</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-2 rounded-lg">
          {error}
        </div>
      )}

      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-sm p-2 rounded-lg">
          {msg}
        </div>
      )}

      {/* OAuth */}
      <div className="space-y-4">
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-3 w-full bg-blue-500 text-black py-2 rounded-xl hover:bg-blue-600 transition"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          onClick={() => handleOAuth("facebook")}
          className="flex items-center justify-center gap-3 w-full bg-blue-500 text-black py-2 rounded-xl hover:bg-blue-600 transition"
        >
          <FacebookIcon />
          Continue with Facebook
        </button>

        <button
          onClick={() => handleOAuth("twitter")}
          className="flex items-center justify-center gap-3 w-full bg-zinc-800 border border-zinc-700 text-zinc-50 py-2 rounded-xl hover:bg-zinc-900 transition"
        >
          <XIcon />
          Continue with X
        </button>

        <button
          onClick={() => handleOAuth("linkedin")}
          className="flex items-center justify-center gap-3 w-full bg-blue-700 text-zinc-50 py-2 rounded-xl hover:bg-blue-800 transition"
        >
          <LinkedInIcon />
          Continue with LinkedIn
        </button>
      </div>

      {/* Divider */}
      <div className="text-center text-zinc-500 text-sm">OR</div>

      {/* Magic Link */}
      <div className="border-zinc-800 space-y-3">
        <Input
          lable="Email for Magic Link"
          type="email"
          value={magicEmail}
          onChange={(e) => setMagicEmail(e.target.value)}
        />

        <button
          type="button"
          onClick={handleMagicLogin}
          className="flex items-center justify-center gap-3 w-full bg-zinc-800 border border-zinc-700 py-2 rounded-xl hover:bg-zinc-700 transition"
        >
          <Mail size={18} />
          Send Magic Link
        </button>
      </div>

      {/* Switch */}
      <p className="text-sm text-center text-zinc-400">
        Don't have an account?{" "}
        <span
          onClick={() => router.push("/signup")}
          className="text-emerald-400 cursor-pointer"
        >
          Sign up
        </span>
      </p>

      {/* Terms & Policy Notice */}
      <p className="text-xs text-zinc-500 mb-2">
        By signing in, you agree to our{" "}
        <Link href="/terms-of-use" className="underline cursor-pointer">
          terms of use
        </Link>{" "}
        and acknowledge you have read our{" "}
        <Link href="/privacy-policy" className="underline cursor-pointer">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
