"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  BicepsFlexed,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "All Posts", href: "/admin/posts", icon: FileText },
  { name: "New Post", href: "/admin/new-post", icon: PlusCircle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ user, isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Desktop collapse toggle
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
    ${isCollapsed ? "md:w-20" : "md:w-64"} 
    md:relative md:translate-x-0 md:flex md:flex-col
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header (Logo) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition group"
          >
            <BicepsFlexed
              size={22}
              className="text-emerald-400 min-w-5.5 group-hover:scale-110 transition-transform"
            />
            {!isCollapsed && (
              <span className="font-bold text-lg text-zinc-100 tracking-tight whitespace-nowrap">
                Shed<span className="text-emerald-400">Body</span>
              </span>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)} // Mobile par click karte hi band ho jaye
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981]"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  size={20}
                  className={
                    active
                      ? "text-emerald-400"
                      : "group-hover:scale-110 transition-transform"
                  }
                />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Collapse Toggle & User) */}
        <div className="p-4 border-t border-zinc-900">
          {!isCollapsed && (
            <div className="mb-4 px-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                Admin
              </p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
          )}

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-emerald-400 transition shadow-inner"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <ChevronLeft size={16} /> Collapse
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
