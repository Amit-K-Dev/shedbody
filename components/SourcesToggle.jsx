"use client";

import { useState } from "react";

export default function SourcesToggle({ count, children }) {
  const [open, setOpen] = useState(false);

  if (!count || count === 0) return null;

  return (
    <div className="mt-10 border-t border-zinc-800 pt-6">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-2 text-lg font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
      >
        <span
          className={`text-xl font-medium inline-block transition-transform duration-300 ${
            open ? "rotate-45 text-emerald-500" : "rotate-0"
          }`}
        >
          +
        </span>
        {count} Source{count !== 1 ? "s" : ""}
      </button>

      {/* Content Box */}
      {open && (
        <div className="mt-6 text-sm text-zinc-400 space-y-2">{children}</div>
      )}
    </div>
  );
}
