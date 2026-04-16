import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import UserAvatar from "@/components/UserAvatar";
import { getUserDisplay } from "@/lib/auth/userDisplay";
import {
  Mail,
  Calendar,
  ShieldCheck,
  Activity,
  Flame,
  ListChecks,
  Settings,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Profile",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { count: plansCount }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("streak_count, gamification_level")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const athlete = getUserDisplay(user);

  const stats = {
    streak: profile?.streak_count || 0,
    level: profile?.gamification_level || 1,
    totalPlans: plansCount || 0,
  };

  return (
    <section className="min-h-screen text-zinc-50 px-4 py-10 pb-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            Athlete Profile <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            Manage your account, track your legacy, and adjust settings.
          </p>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 md:p-8 mb-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
            <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0">
              <div className="absolute inset-0 bg-linear-to-tr from-emerald-400 to-emerald-600 rounded-full blur-md opacity-50 animate-pulse"></div>
              <div className="absolute inset-0 bg-zinc-900 rounded-full border-2 border-zinc-800 m-0.5 overflow-hidden">
                <UserAvatar
                  src={athlete.avatar}
                  alt={athlete.name}
                  className="h-full w-full object-cover"
                  iconClassName="w-12 h-12 text-zinc-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-black rounded-full p-0.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
              </div>
            </div>

            <div className="flex-1 mt-2 md:mt-4">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h2 className="text-2xl md:text-3xl font-black text-zinc-50">
                  {athlete.name}
                </h2>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider hidden md:block">
                  Level {stats.level}
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 text-sm mb-4">
                <Mail className="w-4 h-4" /> {athlete.email}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Joined{" "}
                  {athlete.joined}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                  <Award className="w-3.5 h-3.5" /> Level {stats.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2">
          Lifetime Legacy
        </h3>
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 text-center hover:border-orange-500/30 transition-colors">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl md:text-3xl font-black text-zinc-50">
              {stats.streak}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase mt-1">
              Day Streak
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 text-center hover:border-emerald-500/30 transition-colors">
            <ListChecks className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl md:text-3xl font-black text-zinc-50">
              {stats.totalPlans}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase mt-1">
              Plans Saved
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 text-center hover:border-blue-500/30 transition-colors">
            <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl md:text-3xl font-black text-zinc-50">
              {stats.level}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase mt-1">
              Level
            </p>
          </div>
        </div>

        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2">
          Account Settings
        </h3>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
          <button className="w-full flex items-center justify-between p-5 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-zinc-50 transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-50">
                  App Preferences
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Units, notifications, theme
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>

          <button className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/40 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Unlock elite routines and deep analytics
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
        </div>

        <div className="w-full flex items-center justify-center text-bold">
          <LogoutButton />
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest font-bold">
          Shedbody V2.0 - ID: {athlete.id.split("-")[0]}
        </p>
      </div>
    </section>
  );
}
