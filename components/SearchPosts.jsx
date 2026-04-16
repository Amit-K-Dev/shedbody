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
        const res = await fetch("/api/posts");
        const data = await res.json();

        if (!data) return [];

        const safePosts = Array.isArray(data?.data) ? data.data : [];

        const optimized = safePosts.map((p) => ({
          ...p,
          titleLower: p.title?.toLowerCase() || "",
          categoryLower: p.category?.toLowerCase() || "",
          tagsLower: p.tags?.map((t) => t.toLowerCase()) || [],
        }));

        setPosts(optimized);
      } catch (err) {
        console.error(err);
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
      keys: ["title", "category", "tags"],
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
        <span key={i} className="bg-green-500/30 text-green-300">
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
        placeholder="Search ShedBody..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:border-green-400 outline-none"
      />

      {/* Results Dropdown */}
      {query && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            results.slice(0, 8).map((post, index) => (
              <Link
                key={post.id}
                href={`/${post.category}/${post.slug}`}
                className={`block px-4 py-3 text-sm transition ${
                  index === activeIndex ? "bg-zinc-800" : "hover:bg-zinc-800"
                }`}
              >
                <div className="font-medium">
                  {highlight(post.title, query)}
                </div>
                <div className="text-sm text-zinc-400">
                  {post.category.charAt(0).toUpperCase() +
                    post.category.slice(1)}{" "}
                  &bull; {post.tags?.join(", ")}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-sm text-zinc-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
