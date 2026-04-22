import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
