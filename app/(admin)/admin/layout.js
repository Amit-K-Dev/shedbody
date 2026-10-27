import { getUser } from "@/lib/auth/getUser";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { isD1Binding, getRuntimeD1Binding } from "@/lib/auth/betterAuthEngine.js";

export default async function AdminLayout({ children }) {
  // Check if user is logged in via unified session resolver
  const user = await getUser();
  if (!user) redirect("/login");

  let isAdmin = false;
  // Resolve actual D1 binding from supported Cloudflare Worker / OpenNext runtime context
  // Do not assume process.env.DB is a D1 binding object
  const d1 = getRuntimeD1Binding();
  if (isD1Binding(d1)) {
    try {
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");

      const adapter = new D1Adapter(d1);
      const profileRepo = new ProfileRepository(adapter);

      const publicProfile = await profileRepo.getPublicProfile(user.id);
      isAdmin = publicProfile?.role === "admin";
    } catch (d1Error) {
      console.warn("D1 ProfileRepository error in admin layout:", d1Error?.message || d1Error);
    }
  } else {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";
    } catch (fallbackError) {
      console.error("Admin layout role check fallback error:", fallbackError);
    }
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
