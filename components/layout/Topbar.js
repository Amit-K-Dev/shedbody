"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function Topbar({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="text-sm bg-zinc-800 px-3 py-1 rounded-lg"
        >
          {user?.email.slice(0, 6)}...
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
