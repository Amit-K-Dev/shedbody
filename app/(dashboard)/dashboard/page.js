import { getDashboardData } from "@/lib/dashboard/getDashboardData";
import { getWeightData } from "@/lib/dashboard/getWeightData";
import { getStreak } from "@/lib/dashboard/getStreak";
import { generateInsights } from "@/lib/ai/generateInsights";
import { getProfileData } from "@/lib/dashboard/getProfileData";

// UI
import LevelCard from "@/components/dashboard/LevelCard";
import StreakCard from "@/components/dashboard/StreakCard";
import BMIChart from "@/components/dashboard/BMIChart";
import WeightChart from "@/components/dashboard/WeightChart";
import AddWeightForm from "@/components/dashboard/AddWeightForm";
import SetGoal from "@/components/dashboard/SetGoal";
import Insights from "@/components/dashboard/Insights";
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

export default async function DashboardPage() {
  const [dashboardData, weightData, streak, profileData] = await Promise.all([
    getDashboardData(),
    getWeightData(),
    getStreak(),
    getProfileData(),
  ]);

  const goal = profileData?.target_weight || 72; // Fetch from DB

  const insights = generateInsights({
    weightData: weightData || [],
    bmiLogs: dashboardData?.bmiLogs || [],
    goal,
  });

  const todayLogged = (weightData || []).some(
    (entry) =>
      new Date(entry.created_at).toDateString() === new Date().toDateString(),
  );

  // RETURN UI
  return (
    <div className="space-y-8 pb-32">
      {/* Heading */}
      <h2 className="text-2xl font-bold">Welcome back 👋</h2>

      {/* REMINDER */}
      <ReminderBanner todayLogged={todayLogged} />

      {/* HERO SECTION */}
      <MotionWrapper delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LevelCard
            level={1}
            xp={40}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />
          <StreakCard
            streak={streak}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />

          <StatCard
            title="Latest BMI"
            value={dashboardData?.latestBMI || "--"}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />
        </div>
      </MotionWrapper>

      {/* Stats */}
      <MotionWrapper delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Logs"
            value={dashboardData?.totalLogs || 0}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />
          <StatCard
            title="Category"
            value={dashboardData?.latestCategory || "--"}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />
          <StatCard
            title="Current Weight"
            value={weightData?.at(-1)?.weight || "--"}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />
          <StatCard
            title="Goal"
            value={goal}
            className="hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition"
          />
        </div>
      </MotionWrapper>

      {/* CHART */}
      <MotionWrapper delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeightChart data={weightData} />
          <BMIChart data={dashboardData?.bmiLogs || []} />
        </div>
      </MotionWrapper>

      {/* ACTIONS */}
      <MotionWrapper delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AddWeightForm />
          <SetGoal currentGoal={goal} />
        </div>
      </MotionWrapper>

      {/* AI INSIGHTS */}
      <MotionWrapper delay={0.2}>
        <Insights insights={insights} />
      </MotionWrapper>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-2xl font-bold text-zinc-50 mt-1">{value}</p>
    </div>
  );
}
