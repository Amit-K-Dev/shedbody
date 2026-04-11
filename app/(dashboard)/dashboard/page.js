import { getDashboardData } from "@/lib/dashboard/getDashboardData";
import { getWeightData } from "@/lib/dashboard/getWeightData";
import { getStreak } from "@/lib/dashboard/getStreak";
import { generateInsights } from "@/lib/ai/generateInsights";
import { getProfileData } from "@/lib/dashboard/getProfileData";

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
  const [dashboardData, weightData, streak, profileData] = await Promise.all([
    getDashboardData(),
    getWeightData(),
    getStreak(),
    getProfileData(),
  ]);

  const goal = profileData?.target_weight || 72; // Fetch from DB

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
        </div>
      </div>
    </section>
  );
}
