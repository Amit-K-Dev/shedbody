"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { Toaster } from "react-hot-toast";

export default function AdminLayoutClient({ children, user }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <Sidebar
        user={user}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsMobileOpen(true)} user={user} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
