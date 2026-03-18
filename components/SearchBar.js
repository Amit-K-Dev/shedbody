"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar({ category }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      const currentSearch = params.get("search") || "";

      if (query === currentSearch) return;

      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      params.set("page", "1"); // reset page

      router.push(`/${category}?${params.toString()}`, { scroll: false });
    }, 400); // deounce delay

    return () => clearTimeout(delay);
  }, [query, router, category]);

  return (
    <input
      type="text"
      placeholder="Search articles..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-2 mb-6 rounded bg-zinc-900 border-zinc-800 text-white"
    />
  );
}
