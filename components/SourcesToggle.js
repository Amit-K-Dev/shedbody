"use client";

import { useState } from "react";

export default function SourcesToggle({ count, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10 border-t border-zinc-800 pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-lg font-semibold text-gray-400 hover:text-green-400 transition"
      >
        <span className="text-lg font-bold">{open ? "-" : "+"}</span>
        {count} Sources
      </button>

      {open && (
        <div className="mt-4 text-sm text-zinc-400 space-y-2">{children}</div>
      )}
    </div>
  );
}
