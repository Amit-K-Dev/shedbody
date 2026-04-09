"use client";

import { SidebarClose, SidebarOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Progress", href: "/progress" },
  { name: "BMI Calculator", href: "/calculators/bmi" },
  { name: "My Plan", href: "/plans" },
  { name: "Start New Plan", href: "/start" },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-zinc-900 border-r border-zinc-800 p-4 transition-all duration-300 hidden md:block`}
    >
      {/* Toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="mb-6">
        {collapsed ? (
          <SidebarOpen size={16} className="text-zinc-400" />
        ) : (
          <SidebarClose size={16} className="text-zinc-400" />
        )}
      </button>

      {/* User */}
      {!collapsed && (
        <p className="text-sm text-zinc-400 mb-6">{user?.email}</p>
      )}

      {/* Nav */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-lg transition ${
                active
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400"
              }`}
            >
              {collapsed ? item.name[0] : item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
