"use client";

import { useState } from "react";
import Link from "next/link";
import { BicepsFlexed, Menu, X, LayoutDashboard } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import UserAvatar from "@/components/UserAvatar";
import { getUserDisplay } from "@/lib/auth/userDisplay";

export default function Topbar({ user }) {
  // Desktop Dropdown State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Mobile Menu State
  const [menuOpen, setMenuOpen] = useState(false);

  const profile = getUserDisplay(user);

  return (
    <header className="relative z-50 bg-zinc-950">
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center text-xl font-bold tracking-wide group">
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
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:flex flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 transition flex items-center gap-2"
          >
            <LayoutDashboard size={16} />
            <h1 className="text-sm font-semibold">Dashboard</h1>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((current) => !current)}
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-emerald-500/50 cursor-pointer hover:border-emerald-400 hover:shadow-[0_0_10px_rgba(52,211,153,0.3)] transition"
              aria-label="Open user menu"
              aria-expanded={dropdownOpen}
            >
              <UserAvatar
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
                iconClassName="h-5 w-5 text-emerald-400"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 z-50">
                <LogoutButton />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE TOGGLE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-zinc-300 hover:text-emerald-400 transition cursor-pointer"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU SLIDE-DOWN */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-zinc-950 border-b border-zinc-800 shadow-2xl transition-all duration-300 overflow-hidden z-40 ${
          menuOpen
            ? "max-h-100 opacity-100"
            : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <div className="px-6 py-5 space-y-4">
          {/* User Profile Info Section */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-emerald-500/50 flex items-center justify-center bg-zinc-900">
              <UserAvatar
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
                iconClassName="h-6 w-6 text-emerald-400"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100">
                {profile.name || "User"}
              </span>
              <span className="text-xs text-zinc-500">
                {user?.email || "No email"}
              </span>
            </div>
          </div>

          {/* Links & Actions */}
          <div className="space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition"
            >
              <LayoutDashboard size={18} className="text-emerald-400" />
              My Dashboard
            </Link>

            <div className="pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
