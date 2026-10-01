import { getBoundedProgress } from "@/lib/analytics/progress";
import { getProfileData } from "@/lib/dashboard/getProfileData";
import { getLifestyleData } from "@/lib/dashboard/getLifestyleData";
import { getNutritionData } from "@/lib/dashboard/getNutritionData";
import { getPlans } from "@/lib/storage";
import { getHabitsData } from "@/lib/dashboard/getHabitsData";
import { getActiveGoal } from "@/lib/goals";
import { createClient } from "@/lib/supabase/server";
import { mergeDailyMetrics, generateTimeline } from "@/lib/analytics/unified";
import { generateStructuredInsights } from "@/lib/insights/engine";

import Timeline from "./Timeline";

export const metadata = {
  title: "Health Timeline",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const authContext = { supabase, userId: user?.id };

  // Set default 30-day bounded historical date range
  const now = new Date();
  const past = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  const endDate = now.toISOString().slice(0, 10);
  const startDate = past.toISOString().slice(0, 10);

  const [boundedProgress, profileData, plans, activeWeightGoal, lifestyleLogs, nutritionLogs, habitEntries] = await Promise.all([
    getBoundedProgress(authContext, startDate, endDate),
    getProfileData(authContext),
    getPlans(authContext),
    getActiveGoal("weight", authContext),
    getLifestyleData(authContext, startDate, endDate),
    getNutritionData(authContext, startDate, endDate),
    getHabitsData(authContext, startDate, endDate),
  ]);

  const unifiedMetrics = mergeDailyMetrics(
    boundedProgress,
    nutritionLogs,
    lifestyleLogs
  );

  const currentPlan = (plans || []).find((p) => p.is_active === true);
  const todayStr = new Date().toISOString().slice(0, 10);

  const insights = generateStructuredInsights(
    unifiedMetrics,
    profileData,
    currentPlan,
    activeWeightGoal,
    todayStr
  );

  const timelineEvents = generateTimeline(
    boundedProgress,
    nutritionLogs,
    lifestyleLogs,
    insights,
    { startDate, endDate },
    habitEntries
  );

  return (
    <section className="min-h-screen text-zinc-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-2">Health Timeline</h2>
          <p className="text-zinc-400">
            A chronological feed of your logged health metrics and AI insights.
          </p>
        </div>

        <Timeline events={timelineEvents} />
      </div>
    </section>
  );
}
