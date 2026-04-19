"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ArticleError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Failed to load the article:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>

      <h2 className="text-3xl font-bold text-zinc-50 mb-4">
        Something went wrong!
      </h2>
      <p className="text-zinc-400 max-w-md mb-8 text-lg">
        We couldn't load this article right now. It might have been temporarily
        removed, or there might be an issue with our servers.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          Try Again
        </button>
        <Link
          href="/articles"
          className="px-8 py-3 border border-zinc-600 bg-zinc-900/50 rounded-xl text-zinc-200 hover:border-emerald-500 hover:text-emerald-400 transition-all"
        >
          Browse Articles
        </Link>
      </div>
    </div>
  );
}
