"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import GoogleIcon from "@/components/icons/GoogleIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import Link from "next/link";

const supabase = createClient();

export default function SingupPage() {
  const router = useRouter();

  // OAthut Signup
  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-5 py-6">
      <h2 className="text-xl font-bold text-center mb-10">
        Create your account
      </h2>

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
          className="flex items-center justify-center gap-3 w-full bg-zinc-800 text-zinc-50 border border-zinc-700 py-2 rounded-xl hover:bg-zinc-900 transition"
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

      {/* Switch */}
      <p className="text-sm text-center text-zinc-400">
        Already have an account?{" "}
        <span
          onClick={() => router.push("/login")}
          className="text-emerald-400 cursor-pointer"
        >
          Sign In
        </span>
      </p>

      {/* Terms & Policy Notice */}
      <p className="text-xs text-zinc-500 mb-2">
        By signing up, you agree to our{" "}
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
