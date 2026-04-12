import { getDashboardData } from "@/lib/dashboard/getDashboardData";
import { getWeightData } from "@/lib/dashboard/getWeightData";
import { getStreak } from "@/lib/dashboard/getStreak";
import { generateInsights } from "@/lib/ai/generateInsights";
import { getProfileData } from "@/lib/dashboard/getProfileData";
import { getPlans } from "@/lib/storage";

// UI
import PremiumHeader from "@/components/dashboard/PremiumHeader";
import StatCards from "@/components/dashboard/StatCards";
import PremiumInsights from "@/components/dashboard/PremiumInsights";
import PremiumChart from "@/components/dashboard/PremiumChart";
import PremiumBMI from "@/components/dashboard/PremiumBMI";
import PremiumAddWeight from "@/components/dashboard/PremiumAddWeight";
import PremiumSetGoal from "@/components/dashboard/PremiumSetGoal";
import ReminderBanner from "@/components/dashboard/ReminderBanner";
import MotionWrapper from "@/components/ui/MotionWrapper";

// Icons & Link fro Protocol Section
import Link from "next/link";
import {
  Flame,
  Dumbbell,
  CalendarDays,
  Utensils,
  ArrowRight,
  Sparkles,
  History,
  Target,
} from "lucide-react";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
    nosnippet: true,
    nocache: true,
  },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [dashboardData, weightData, streak, profileData, plans] =
    await Promise.all([
      getDashboardData(),
      getWeightData(),
      getStreak(),
      getProfileData(),
      getPlans(),
    ]);

  const goal = profileData?.target_weight || 72;

  const heightInMeters = profileData?.height ? profileData.height / 100 : 1;
  const bmiHistory = (weightData || []).map((item) => {
    return {
      date: new Date(item.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      bmi: Number((item.weight / (heightInMeters * heightInMeters)).toFixed(1)),
    };
  });

  const insights = generateInsights({
    weightData: weightData || [],
    bmiLogs: dashboardData?.bmiLogs || [],
    goal,
  });

  const todayLogged = (weightData || []).some(
    (entry) =>
      new Date(entry.created_at).toDateString() === new Date().toDateString(),
  );

  const currentWeight = weightData?.[weightData.length - 1]?.weight;

  // Separate Current and Previous Plans
  const currentPlan = (plans || []).find((p) => p.is_active === true);
  const previousPlan = (plans || []).find((p) => p.is_active === false);

  // UI
  return (
    <section className="min-h-screen text-zinc-50 px-4 py-10">
      <div className="max-w-4xl mx-auto ">
        <div className="space-y-8 pb-32">
          {/* Heading */}
          <h2 className="text-2xl font-bold">Welcome back 👋</h2>

          {/* HERO SECTION */}
          <PremiumHeader profile={profileData} />

          {/* REMINDER */}
          <ReminderBanner todayLogged={todayLogged} />

          {/* STATS */}
          <MotionWrapper delay={0.1}>
            <StatCards
              latestBMI={dashboardData?.latestBMI || "--"}
              totalLogs={weightData?.length || 0}
              category={dashboardData?.latestCategory || "--"}
              currentWeight={currentWeight}
              goalWeight={goal}
            />
          </MotionWrapper>

          {/* ACTIONS */}
          <MotionWrapper delay={0.2}>
            <div className="grid grid-cols-1 gap-6">
              <PremiumAddWeight lastWeight={currentWeight} />
              <PremiumSetGoal currentTarget={profileData?.target_weight} />
            </div>
          </MotionWrapper>

          {/* CHART */}
          <MotionWrapper delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PremiumChart
                weightData={weightData}
                goalWeight={profileData?.target_weight}
              />
              <PremiumBMI bmiData={bmiHistory} />
            </div>
          </MotionWrapper>

          {/* AI COACH INSIGHTS */}
          <MotionWrapper delay={0.2}>
            <PremiumInsights insights={insights} />
          </MotionWrapper>

          {/* PROTOCOL SECTION */}
          <MotionWrapper delay={0.3}>
            <div className="space-y-6 mt-4">
              {/* ZERO PLANS STATE */}
              {!currentPlan && !previousPlan && (
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 text-center">
                  <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                  <h2 className="text-lg font-bold text-zinc-50 mb-2">
                    No Active Protocol
                  </h2>
                  <p className="text-zinc-400 mb-6 text-sm">
                    You haven't generated or set any plan as active yet.
                  </p>
                  <Link
                    href="/start"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
                  >
                    <Sparkles className="w-5 h-5" /> Generate Smart Plan
                  </Link>
                </div>
              )}

              {/* THE CURRENT PROTOCOL (HERO CARD) */}
              {currentPlan && (
                <div>
                  <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
                    <Sparkles className="w-4 h-4" /> Active Protocol
                  </h2>

                  <div className="relative bg-zinc-900/60 backdrop-blur-md border border-emerald-500/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 mb-6">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-md uppercase">
                            {currentPlan.goal?.replace("_", " ")}
                          </span>
                          <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 rounded-md uppercase">
                            {currentPlan.level}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-zinc-50">
                          Daily Targets
                        </h3>
                      </div>

                      <div className="flex gap-3">
                        <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl min-w-25">
                          <Flame className="w-4 h-4 text-orange-500 mb-1" />
                          <p className="text-xl font-black">
                            {currentPlan.calories}{" "}
                            <span className="text-xs text-zinc-500 font-normal">
                              kcal
                            </span>
                          </p>
                        </div>
                        <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl min-w-25">
                          <Dumbbell className="w-4 h-4 text-blue-500 mb-1" />
                          <p className="text-xl font-black">
                            {currentPlan.protein}{" "}
                            <span className="text-xs text-zinc-500 font-normal">
                              g
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-4">
                      <div className="bg-zinc-950/50 border border-zinc-800/50 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-emerald-400" />{" "}
                          Workout
                        </h4>
                        <p className="text-sm text-zinc-300 line-clamp-2">
                          {currentPlan.workout?.[0]}
                        </p>
                      </div>
                      <div className="bg-zinc-950/50 border border-zinc-800/50 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 mb-2">
                          <Utensils className="w-4 h-4 text-emerald-400" />{" "}
                          Meals
                        </h4>
                        <p className="text-sm text-zinc-300 line-clamp-2">
                          {currentPlan.meals?.breakfast}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-end relative z-10">
                      <Link
                        href="/plans"
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-bold flex items-center gap-2 transition-colors"
                      >
                        View Full Routine <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* THE PREVIOUS PROTOCOL (COMPARISON) */}
              {previousPlan && (
                <div>
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2 px-2 mt-2">
                    <History className="w-4 h-4" /> Legacy Protocol
                  </h2>

                  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">
                          {previousPlan.goal?.replace("_", " ")} &bull;{" "}
                          {previousPlan.level}
                        </span>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                            <Flame className="w-3.5 h-3.5 text-zinc-500" />{" "}
                            {previousPlan.calories} kcal
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                            <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />{" "}
                            {previousPlan.protein} g
                          </div>
                        </div>
                      </div>

                      {currentPlan && (
                        <div className="px-3 py-1.5 bg-zinc-950 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 font-medium">
                          {currentPlan.calories < previousPlan.calories
                            ? `↓ Dropped ${previousPlan.calories - currentPlan.calories} kcal`
                            : currentPlan.calories > previousPlan.calories
                              ? `↑ Added ${currentPlan.calories - previousPlan.calories} kcal`
                              : "Same Caloric Intake"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
