"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function InlineRelatedArticle({ posts }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !posts || posts.length === 0) return null;

  return (
    <section className="mt-16 border border-zinc-800 rounded-xl p-6 bg-zinc-900/40">
      <h3 className="text-lg font-semibold mb-4 text-white">
        You may also like
      </h3>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/${post.category}/${post.slug}`}
              className="text-emerald-400 no-underline hover:text-emerald-300 transition-colors"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
