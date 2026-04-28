"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  Flame,
  Dumbbell,
  BicepsFlexed,
  Apple,
  Salad,
  Activity,
  Menu,
  Search,
  X,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import SearchPosts from "@/components/SearchPosts";

const categories = [
  { name: "Yoga", slug: "yoga", icon: Flame },
  { name: "Exercises", slug: "exercises", icon: Dumbbell },
  { name: "Nutrition", slug: "nutrition", icon: Apple },
  { name: "Recipes", slug: "recipes", icon: Salad },
  { name: "BMI", slug: "calculators/bmi", icon: Activity },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopSearchRef = useRef(null);

  // Auth States
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path) => pathname === path;

  useEffect(() => {
    setDesktopSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!desktopSearchOpen) return;

    function handlePointerDown(event) {
      if (!desktopSearchRef.current?.contains(event.target)) {
        setDesktopSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [desktopSearchOpen]);

  // Supabase Auth Check & Real-time Listener
  useEffect(() => {
    const supabase = createClient();

    // Function to fetch user data
    const fetchUserData = async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch role from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, avatar_url")
          .eq("id", currentUser.id)
          .single();

        setRole(profile?.role || "user");
        setAvatar(profile?.avatar_url || null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    // Initial Check
    supabase.auth.getUser().then(({ data: { user } }) => {
      fetchUserData(user);
    });

    // The Magic Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      fetchUserData(session?.user || null);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-xl shadow-lg border-b border-zinc-800 py-2"
          : "bg-zinc-950/60 backdrop-blur-md py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-xl font-bold tracking-wide group"
        >
          <BicepsFlexed
            size={22}
            className="text-emerald-400 mr-2 group-hover:scale-110 transition"
          />
          <span className="text-zinc-50">Shed</span>
          <span className="text-emerald-400">Body</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={`group flex items-center gap-2 text-sm font-medium transition ${
                isActive(`/${cat.slug}`)
                  ? "text-emerald-400"
                  : "text-zinc-300 hover:text-emerald-300"
              }`}
            >
              <cat.icon
                size={16}
                className="transition group-hover:text-emerald-400"
              />
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <div ref={desktopSearchRef} className="hidden md:flex items-center">
            {desktopSearchOpen ? (
              <div className="flex w-72 items-center gap-2">
                <SearchPosts autoFocus />
                <button
                  type="button"
                  onClick={() => setDesktopSearchOpen(false)}
                  aria-label="Close search"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDesktopSearchOpen(true)}
                aria-label="Open search"
                className="grid size-10 place-items-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300 hover:shadow-emerald-500/10"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {!loading && (
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* Dynamic CTA Button based on Role */}
                  <Link
                    href={role === "admin" ? "/admin" : "/dashboard"}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 hover:border-emerald-500/50 transition flex items-center gap-2"
                  >
                    {role === "admin" ? (
                      <Settings size={16} className="text-emerald-400" />
                    ) : (
                      <LayoutDashboard size={16} className="text-emerald-400" />
                    )}
                    {role === "admin" ? "Admin Panel" : "Dashboard"}
                  </Link>

                  {/* Profile Avatar */}
                  <Link href="/profile">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-emerald-500/30 transition shadow-sm">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="User Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={18} className="text-emerald-400" />
                      )}
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-zinc-300 hover:text-zinc-50 transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/start"
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 text-black hover:scale-105 transition shadow-md"
                  >
                    Start Plan
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Toggle */}
          {/* Profile Avatar */}
          <Link href="/profile" className="md:hidden">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-emerald-500/30 transition shadow-sm">
              {avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={18} className="text-emerald-400" />
              )}
            </div>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-zinc-300 hover:text-zinc-50 transition cursor-pointer"
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
        <div className="px-4 pb-6 bg-zinc-950 border-t border-zinc-800">
          <div className="mt-4 mb-6">
            <SearchPosts />
          </div>

          <div className="space-y-1 mb-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${
                  isActive(`/${cat.slug}`)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                }`}
              >
                <cat.icon size={18} />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* User Specific Mobile Section */}
          {!loading && (
            <div className="pt-4 border-t border-zinc-800">
              {user ? (
                <>
                  {/* Section Divider Headname */}
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                    {role === "admin" ? "Admin Controls" : "My Dashboard"}
                  </h4>
                  <div className="space-y-1">
                    <Link
                      href={role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition"
                    >
                      {role === "admin" ? (
                        <Settings size={18} />
                      ) : (
                        <LayoutDashboard size={18} />
                      )}
                      {role === "admin" ? "Open Admin Panel" : "My Progress"}
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition"
                    >
                      <User size={18} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut size={18} />
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-900 transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/start"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition shadow-md"
                  >
                    Start Free Plan
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
