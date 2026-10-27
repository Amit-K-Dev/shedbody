import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/getUser.js";
import NotificationPreferencesForm from "@/components/notifications/NotificationPreferencesForm";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "App Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  let preferences = null;
  try {
    const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
    const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
    const adapter = new D1Adapter();
    adapter._checkDb();
    const profileRepo = new ProfileRepository(adapter);
    preferences = await profileRepo.getPreferences(user.id);
  } catch (d1Error) {
    console.warn("D1 ProfileRepository fallback to Supabase (profile/settings):", d1Error?.message || d1Error);
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) preferences = data;
    } catch {}
  }

  if (!preferences) {
    // Fallback defaults
    preferences = {
      workout_reminders: true,
      goal_reminders: true,
      habit_reminders: true,
      weekly_progress: true,
      plan_updates: true,
    };
  }

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
