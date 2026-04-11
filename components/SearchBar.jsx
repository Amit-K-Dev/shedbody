"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar({ category }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for the input
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setQuery(currentSearch);
  }, [searchParams]);

  // Debounced search logic
  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSearch = params.get("search") || "";

      if (query === currentSearch) return;

      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      params.set("page", "1");
      const queryString = params.toString();
      const basePath = category === "all" ? "/articles" : `/${category}`;
      const finalUrl = queryString ? `${basePath}?${queryString}` : basePath;

      router.push(finalUrl, { scroll: false });
    }, 400);

    return () => clearTimeout(delay);
  }, [query, category, router, searchParams]);

  return (
    <div className="relative mb-8 max-w-xl">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>

      <input
        type="text"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
      />
    </div>
  );
}
