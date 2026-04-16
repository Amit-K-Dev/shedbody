"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { BicepsFlexed } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { getUserDisplay } from "@/lib/auth/userDisplay";

export default function Topbar({ user }) {
  const [open, setOpen] = useState(false);

  const profile = getUserDisplay(user);

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 z-50">
      <div className="flex items-center text-xl font-bold tracking-wide group">
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
      </div>
      <div className="flex flex-row items-center gap-3">
        <Link
          href="/dashboard"
          className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-lg hover:bg-emerald-400 hover:text-zinc-950 transition"
        >
          <h1 className="text-sm font-semibold">Dashboard</h1>
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm text-zinc-400 cursor-pointer hover:text-emerald-400 transition"
            aria-label="Open user menu"
            aria-expanded={open}
          >
            <UserAvatar
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-cover"
              iconClassName="h-6 w-6"
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-2">
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
