"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchPosts from "./SearchPosts";

const categories = [
  { name: "Yoga", slug: "yoga" },
  { name: "Exercises", slug: "exercises" },
  { name: "Nutrition", slug: "nutrition" },
  { name: "Recipes", slug: "Recipes" },
  { name: "Articles", slug: "articles" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-green-400 tracking-wide"
        >
          <span className="text-white">Shed</span>
          <span className="text-green-400">Body</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={`text-sm transition nav-link ${
                isActive(`/${cat.slug}`)
                  ? "text-green-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="flex flex-col justify-between w-6 h-5 md:hidden text-gray-300 tracking-wide"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block h-0.5 w-full bg-gray-300 rounded"></span>
          <span className="block h-0.5 w-full bg-gray-300 rounded"></span>
          <span className="block h-0.5 w-full bg-gray-300 rounded"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-700 px-4 pb-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm hover:text-green-400 ${
                isActive(`/${cat.slug}`) ? "text-green-400" : "text-gray-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <SearchPosts />
    </header>
  );
}
