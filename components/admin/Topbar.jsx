"use client";

import { Menu, LogOut } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import LogoutButton from "@/components/LogoutButton";
import { getUserDisplay } from "@/lib/auth/userDisplay";

export default function Topbar({ onMenuClick, user }) {
  const profile = getUserDisplay(user);
  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 rounded-lg transition"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-semibold text-zinc-300 tracking-wide">
              CMS Console
            </h2>
          </div>
        </div>
      </div>

      {/* Right Section - Profile & Logout */}
      <div className="flex items-center gap-4">
        {/* Logout Button: Desktop par text ke sath, Mobile par sirf Icon */}
        <div className="mr-2">
          <LogoutButton variant="ghost" />
        </div>

        <div className="h-8 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider leading-none">
              Hi, {profile?.name}
            </p>
            <p className="text-[11px] text-zinc-500 truncate max-w-30">
              {user?.email}
            </p>
          </div>

          <div className="h-9 w-9 rounded-full border border-emerald-500/30 overflow-hidden bg-zinc-900 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <UserAvatar
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
