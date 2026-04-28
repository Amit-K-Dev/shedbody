"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarClose,
  SidebarOpen,
  User,
  Baby,
  Calculator,
  ClipboardList,
  PlusCircle,
} from "lucide-react";

const navItems = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "BMI Calculator", href: "/calculators/bmi", icon: Calculator },
  { name: "Calorie Calculator", href: "/calculators/calorie", icon: Calculator },
  { name: "Pregnancy Calculator", href: "/calculators/pregnancy", icon: Baby },
  { name: "Baby Percentile", href: "/calculators/baby-percentile", icon: Baby },
  { name: "My Plan", href: "/plans", icon: ClipboardList },
  { name: "Start New Plan", href: "/start", icon: PlusCircle },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-zinc-950 border-r border-zinc-800 p-4 transition-all duration-300 hidden md:flex md:flex-col min-h-[calc(100vh-64px)]`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 flex items-center justify-center p-2 hover:bg-zinc-900 rounded-lg transition self-start"
      >
        {collapsed ? (
          <SidebarOpen
            size={20}
            className="text-zinc-400 hover:text-emerald-400"
          />
        ) : (
          <SidebarClose
            size={20}
            className="text-zinc-400 hover:text-emerald-400"
          />
        )}
      </button>

      {/* User Info */}
      {!collapsed && (
        <div className="mb-6 px-2">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Logged In As
          </p>
          <p className="text-sm text-zinc-300 truncate">{user?.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : ""}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                active
                  ? "text-emerald-400 bg-emerald-500/10 shadow-[inset_2px_0_0_0_#34d399]"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-emerald-400"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon
                size={20}
                className={active ? "text-emerald-400" : ""}
              />

              {!collapsed && (
                <span className="font-medium text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
