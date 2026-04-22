import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect route
  if (!user) {
    redirect("/login");
  }

  return (
    <section className="flex h-screen bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_50%)] text-zinc-300">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar user={user} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}

          <MobileNav />
        </div>
      </div>
    </section>
  );
}
