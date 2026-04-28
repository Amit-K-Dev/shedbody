"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

export default function SearchPosts() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);

  // Fetch + preprocess
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/search-index");
        const contentType = res.headers.get("content-type") || "";

        if (!res.ok || !contentType.includes("application/json")) {
          console.warn("Failed to fetch posts for search", {
            status: res.status,
            contentType,
          });
          return;
        }

        const data = await res.json();

        if (!data) return [];

        const safePosts = Array.isArray(data?.data) ? data.data : [];

        const optimized = safePosts.map((p) => {
          let safeKeywordsArray = [];
          if (typeof p.keywords === "string") {
            safeKeywordsArray = p.keywords
              .split(",")
              .map((k) => k.trim().toLowerCase());
          } else if (Array.isArray(p.keywords)) {
            safeKeywordsArray = p.keywords.map((k) =>
              typeof k === "string" ? k.trim().toLowerCase() : "",
            );
          }

          return {
            ...p,
            titleLower: p.title?.toLowerCase() || "",
            categoryLower: p.category?.toLowerCase() || "",
            keywordsLower: safeKeywordsArray,
            primaryKeyword:
              safeKeywordsArray.length > 0 ? safeKeywordsArray[0] : "",
          };
        });

        setPosts(optimized);
      } catch (err) {
        console.warn("Failed to fetch posts for search", err);
      }
    }

    fetchPosts();
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setActiveIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fuse instance (fuzzy search)
  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: ["title", "category", "keywordsLower"],
      threshold: 0.35,
    });
  }, [posts]);

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    return fuse.search(debouncedQuery).map((r) => r.item);
  }, [debouncedQuery, fuse]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (!results.length) return;

      if (e.key === "ArrowDown") {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }

      if (e.key === "ArrowUp") {
        setActiveIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
      }

      if (e.key === "Enter") {
        const post = results[activeIndex];
        if (post) {
          window.location.href = `/${post.category}/${post.slug}`;
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [results, activeIndex]);

  // Highlight match
  function highlight(text, query) {
    if (!query) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-emerald-500/30 text-emerald-300">
          {part}
        </span>
      ) : (
        part
      ),
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto relative">
      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search articles, workouts, nutrition..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
      />

      {/* Results Dropdown */}
      {query && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50 overflow-hidden">
          {results.length > 0 ? (
            <div className="py-2">
              {results.slice(0, 8).map((post, index) => (
                <Link
                  key={post.id}
                  href={`/${post.category ? post.category.toLowerCase() : "general"}/${post.slug}`}
                  className={`block px-4 py-3 text-sm transition border-l-2 ${
                    index === activeIndex
                      ? "bg-zinc-800/80 border-emerald-500"
                      : "border-transparent hover:bg-zinc-800/50 hover:border-zinc-600"
                  }`}
                >
                  <div className="font-semibold text-zinc-200">
                    {highlight(post.title, query)}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                    <span className="uppercase tracking-wider font-bold text-zinc-500">
                      {post.category}
                    </span>
                    {/* Safely render keyword */}
                    {post.primaryKeyword && (
                      <>
                        <span>&bull;</span>
                        <span className="truncate opacity-70 capitalize">
                          {post.primaryKeyword}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-zinc-500">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
