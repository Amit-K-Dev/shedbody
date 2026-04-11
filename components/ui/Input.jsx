"use client";

import { useState } from "react";

export default function Input({
  lable,
  type = "text",
  value,
  onChange,
  required,
}) {
  const [focused, setFucused] = useState(false);

  const isActive = focused || value;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFucused(true)}
        onBlur={() => setFucused(false)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 pt-5 tex-sm outline-none focus:border-emerald-500 transition"
      />
      <lable
        className={`absolute left-4 transition-all text-zinc-400 pointer-events-none ${
          isActive ? "top-1 text-xs text-green-400" : "top-3 text-sm"
        }`}
      >
        {lable}
      </lable>
    </div>
  );
}
