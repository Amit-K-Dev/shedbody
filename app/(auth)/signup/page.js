"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import GoogleIcon from "@/components/icons/GoogleIcon";
import FacebookIcon from "@/components/icons/FacebookIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [magicEmail, setMagicEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Magic Link Signup handler via Better Auth
  const handleMagicSignup = async () => {
    setMsg("");
    setError("");

    const email = magicEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          callbackURL: `${window.location.origin}/dashboard`,
          errorCallbackURL: `${window.location.origin}/signup`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403 && data.error === "RECIPIENT_NOT_ALLOWED") {
          setError("This email is not permitted on this environment.");
        } else if (res.status === 429) {
          setError("Too many requests. Please wait 60 seconds and try again.");
        } else if (res.status === 503) {
          setError("Authentication service is temporarily unavailable. Please try again later.");
        } else {
          setError(data.message || data.error || "Failed to send magic link. Please try again.");
        }
        return;
      }

      setMsg("Magic link sent! Check your inbox.");
    } catch {
      setError("Network error: unable to contact authentication service.");
    } finally {
      setLoading(false);
    }
  };

  // OAuth Signup: Preserves Google, Facebook, Twitter/X, and LinkedIn via Better Auth
  const handleOAuth = async (provider) => {
    setError("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          callbackURL: `${window.location.origin}/dashboard`,
          errorCallbackURL: `${window.location.origin}/signup`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }

      // Fail-Closed: If Better Auth social sign-in returns non-200 (e.g. 503 server gate disabled),
      // display the disabled error and return immediately. Do NOT silently fall through to Supabase.
      if (res.status === 503) {
        setError("Authentication service is temporarily unavailable. Please try again later.");
      } else {
        setError(data?.message || data?.error || `Failed to initiate ${provider} registration.`);
      }
    } catch (err) {
      setError(err?.message || `Failed to initiate ${provider} registration.`);
    }
  };

  return (
    <div className="space-y-5 py-6">
      <h2 className="text-xl font-bold text-center mb-8">
        Create your account
      </h2>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {msg && (
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-sm p-3 rounded-lg">
          <CheckCircle size={18} className="shrink-0 mt-0.5" />
          <span>{msg}</span>
        </div>
      )}

      {/* OAuth */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-3 w-full bg-blue-500 text-black py-2 rounded-xl hover:bg-blue-600 transition"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuth("facebook")}
          className="flex items-center justify-center gap-3 w-full bg-blue-500 text-black py-2 rounded-xl hover:bg-blue-600 transition"
        >
          <FacebookIcon />
          Continue with Facebook
        </button>

        <button
          type="button"
          onClick={() => handleOAuth("twitter")}
          className="flex items-center justify-center gap-3 w-full bg-zinc-800 text-zinc-50 border border-zinc-700 py-2 rounded-xl hover:bg-zinc-900 transition"
        >
          <XIcon />
          Continue with X
        </button>

        <button
          type="button"
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
          placeholder="your.email@example.com"
        />

        <button
          type="button"
          disabled={loading}
          onClick={handleMagicSignup}
          className="flex items-center justify-center gap-3 w-full bg-zinc-800 border border-zinc-700 py-2 rounded-xl hover:bg-zinc-700 transition disabled:opacity-50"
        >
          <Mail size={18} />
          {loading ? "Sending..." : "Send Magic Link"}
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading signup...</div>}>
      <SignupForm />
    </Suspense>
  );
}
