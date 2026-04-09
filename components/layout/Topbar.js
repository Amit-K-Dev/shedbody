"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function Topbar({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950">
      <Link
        href="/dashboard"
        className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-1 rounded-lg hover:bg-emerald-400 hover:text-zinc-950 transition"
      >
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </Link>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="text-sm bg-zinc-800 px-3 py-1 rounded-lg cursor-pointer"
        >
          {user?.name.slice(0, 5)}...
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-2">
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
