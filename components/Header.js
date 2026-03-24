"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  BicepsFlexed,
  Apple,
  Salad,
  LineChart,
  Menu,
  X,
} from "lucide-react";
import SearchPosts from "./SearchPosts";

const categories = [
  { name: "Yoga", slug: "yoga", icon: Dumbbell },
  { name: "Exercises", slug: "exercises", icon: BicepsFlexed },
  { name: "Nutrition", slug: "nutrition", icon: Apple },
  { name: "Recipes", slug: "recipes", icon: Salad },
  { name: "Progress", slug: "progress", icon: LineChart },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  // Scroll Effect (Shrink Navbar)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl shadow-lg border-b border-gray-800 py-2"
          : "bg-black/70 backdrop-blur-md py-3"
      }`}
    >
      {/* MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-xl font-bold tracking-wide group"
        >
          <BicepsFlexed
            size={22}
            className="text-green-400 mr-2 group-hover:scale-110 transition"
          />
          <span className="text-white">Shed</span>
          <span className="text-green-500">Body</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={`flex items-center gap-2 text-sm font-medium transition nav-link relative group ${
                isActive(`/${cat.slug}`)
                  ? "text-green-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <cat.icon size={16} />
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* Search Desktop */}
          <div className="hidden md:block w-52">
            <SearchPosts />
          </div>
          {/* CTA */}
          <Link
            href="/start"
            className="hidden md:inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black hover:scale-105 transition shadow-md"
          >
            Start Plan
          </Link>
          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-300 hover:text-white transition cursor-pointer"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-150 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 bg-black border-t border-gray-800">
          {/* Mobile Search */}
          <div className="mt-3 mb-4">
            <SearchPosts />
          </div>

          {/* Mobile Nav */}
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 py-2 text-sm transition ${
                isActive(`/${cat.slug}`)
                  ? "text-green-400"
                  : "text-gray-300 hover:text-green-400"
              }`}
            >
              <cat.icon size={16} />
              {cat.name}
            </Link>
          ))}

          {/* Mobile CTA */}
          <Link
            href="/start"
            className="block mt-4 text-center px-4 py-2 rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black font-semibold hover:scale-102 transition shadow-md"
          >
            Start Plan
          </Link>
        </div>
      </div>
    </header>
  );
}
