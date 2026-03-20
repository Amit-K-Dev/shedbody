"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPosts() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    }
    fetchPosts();
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="max-w-xl mx-auto m-3">
      <input
        type="text"
        placeholder="Search ShedBody..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 rounded-md bg-zinc-900 border border-zinc-700 text-white"
      />

      {query && (
        <div className="mt-4 space-y-2">
          {filtered.slice(0, 8).map((post) => (
            <Link
              key={post.id}
              href={`/${post.category}/${post.slug}`}
              className="block p-3 bg-zinc-900 rounded hover:bg-zinc-800"
            >
              {post.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
