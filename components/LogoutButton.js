"use client";

import { logout } from "@/lib/actions/logout";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="bg-red-400 text-black px-4 py-2 rounded-xl hover:bg-red-500 transition"
    >
      Logout
    </button>
  );
}
