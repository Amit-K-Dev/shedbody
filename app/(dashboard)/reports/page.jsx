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
import { generateReport } from "@/lib/reports/engine";
import Link from "next/link";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Target, 
  Activity, 
  AlertCircle,
  Lightbulb,
  ShieldCheck
} from "lucide-react";

export const metadata = {
  title: "Reports | ShedBody",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const authContext = { supabase, userId: user?.id };
  
  const typeParam = searchParams.type || 'weekly';
  const type = ['weekly', 'monthly', 'goal', 'progress'].includes(typeParam) ? typeParam : 'weekly';

  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  
  let startDate;
  if (type === 'weekly') {
    startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  } else if (type === 'monthly') {
    startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  } else {
    // For progress and goal reports, fetch all history. Provide a safe distant past date.
    startDate = "2020-01-01";
  }

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
  
  const insights = generateStructuredInsights(
    unifiedMetrics,
    profileData,
    currentPlan,
    activeWeightGoal,
    endDate
  );

  const timelineEvents = generateTimeline(
    boundedProgress,
    nutritionLogs,
    lifestyleLogs,
    insights,
    { startDate, endDate }, // Passing the bounds so Timeline filters out-of-bound insights
    habitEntries
  );

  // Generate the report via the deterministic engine
  const report = generateReport(timelineEvents, type, activeWeightGoal, endDate, { startDate, endDate });

  const tabs = [
    { id: 'weekly', label: 'Weekly Report' },
    { id: 'monthly', label: 'Monthly Report' },
    { id: 'progress', label: 'Overall Progress' },
    { id: 'goal', label: 'Goal Report' },
  ];

  return (
    <section className="min-h-screen text-zinc-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
            <FileText className="text-emerald-400" /> Personal Health Reports
          </h2>
          <p className="text-zinc-400">
            Automated summaries of your progress, trends, and areas for improvement.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/reports?type=${tab.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                type === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Goal Context Banner (Only for Goal Report) */}
        {type === 'goal' && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <Target className="text-purple-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-400 mb-1">Active Goal Context</h3>
              {activeWeightGoal ? (
                <p className="text-sm text-zinc-300">
                  Target Weight: <strong className="text-zinc-100">{activeWeightGoal.target_value} kg</strong> 
                  {" "}(Started at {activeWeightGoal.start_value} kg)
                </p>
              ) : (
                <p className="text-sm text-zinc-300">
                  No active weight goal found. The report will provide neutral trend analysis.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="space-y-6">
          
          {/* What Happened */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-blue-400" size={20} />
              <h3 className="font-semibold text-zinc-200">What Happened</h3>
            </div>
            <ul className="space-y-3">
              {report.whatHappened.length > 0 ? (
                report.whatHappened.map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="text-blue-500/50 mt-1">•</span> {item}
                  </li>
                ))
              ) : (
                <p className="text-sm text-zinc-500 italic">No significant events detected.</p>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Improved */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-emerald-400" size={20} />
                <h3 className="font-semibold text-zinc-200">What Improved</h3>
              </div>
              <ul className="space-y-3">
                {report.whatImproved.length > 0 ? (
                  report.whatImproved.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                      <CheckCircle className="text-emerald-500/50 mt-0.5 shrink-0" size={14} /> {item}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 italic">No specific improvements detected this period.</p>
                )}
              </ul>
            </div>

            {/* What Declined */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-red-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="text-red-400" size={20} />
                <h3 className="font-semibold text-zinc-200">What Declined</h3>
              </div>
              <ul className="space-y-3">
                {report.whatDeclined.length > 0 ? (
                  report.whatDeclined.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                      <AlertCircle className="text-red-500/50 mt-0.5 shrink-0" size={14} /> {item}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 italic">No specific declines detected this period.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Important Trends */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-400" size={20} />
              <h3 className="font-semibold text-zinc-200">Important Trends</h3>
            </div>
            <ul className="space-y-3">
              {report.importantTrends.length > 0 ? (
                report.importantTrends.map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="text-purple-500/50 mt-1">•</span> {item}
                  </li>
                ))
              ) : (
                <p className="text-sm text-zinc-500 italic">No clear trends detected yet.</p>
              )}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="text-yellow-400" size={20} />
              <h3 className="font-semibold text-zinc-200">Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {report.recommendations.length > 0 ? (
                report.recommendations.map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <ShieldCheck className="text-yellow-500/50 mt-0.5 shrink-0" size={16} /> {item}
                  </li>
                ))
              ) : (
                <p className="text-sm text-zinc-500 italic">Continue logging data to receive recommendations.</p>
              )}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
