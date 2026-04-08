"use client";

import { useState } from "react";

export default function PasswordInput({ value, onChange, lable = "Password" }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const isActive = focused || value;

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 pt-5 pb-2 pr-10 text-sm outline-none focus:bordr-emerald-500 transition"
      />

      <lable
        className={`absolute left-4 transition-all text-zinc-400 pointer-events-none ${
          isActive ? "top-1 text-xs text-emerald-400" : "top-3 text-sm"
        }`}
      >
        {lable}
      </lable>

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-3 text-zinc-400 text-sm"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
