import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationPreferencesForm from "@/components/notifications/NotificationPreferencesForm";
import { getNotificationPreferences } from "@/lib/dashboard/getNotificationPreferences";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "App Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const preferences = await getNotificationPreferences({ supabase, userId: user.id });

  return (
    <section className="min-h-screen text-zinc-50 px-4 py-10 pb-32 bg-black relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-emerald-400 mb-6 transition">
            <ArrowLeft size={16} className="mr-1" /> Back to Profile
          </Link>
          <h1 className="text-3xl font-black tracking-tight">App Settings</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Manage your notifications and application preferences.
          </p>
        </div>

        <NotificationPreferencesForm initialPreferences={preferences} />
      </div>
    </section>
  );
}
