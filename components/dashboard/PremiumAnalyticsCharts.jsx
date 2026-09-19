"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
} from "recharts";
import { Activity, Apple, Moon } from "lucide-react";

export function formatChartData(unifiedTimeline) {
  if (!unifiedTimeline || unifiedTimeline.length === 0) return [];

  return unifiedTimeline.map((item) => {
    // "YYYY-MM-DD" parsing
    const [y, m, d] = item.date.split("-");
    const dateObj = new Date(y, m - 1, d);
    const dateLabel = dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    return {
      dateLabel,
      calories: item.nutrition.calories,
      protein: item.nutrition.protein,
      water: item.nutrition.water,
      steps: item.lifestyle.steps,
      sleep: item.lifestyle.sleepHours,
      // Strictly map true -> 1, false -> 0, null -> null
      workout: item.lifestyle.workoutCompleted === true ? 1 : (item.lifestyle.workoutCompleted === false ? 0 : null),
    };
  });
}

export default function PremiumAnalyticsCharts({ unifiedTimeline }) {
  if (!unifiedTimeline || unifiedTimeline.length === 0) return null;
  const chartData = formatChartData(unifiedTimeline);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* NUTRITION CHART */}
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 group">
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors duration-700"></div>
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <div className="p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Apple className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-50 tracking-tight">
            Nutrition Trends
          </h3>
        </div>

        <div className="w-full h-64 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dx={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.8)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(63, 63, 70, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
              />
              <Bar yAxisId="left" dataKey="water" name="Water (ml)" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.6} />
              <Bar yAxisId="left" dataKey="calories" name="Calories (kcal)" fill="url(#colorCal)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="protein" name="Protein (g)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: "#18181b", stroke: "#3b82f6", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LIFESTYLE CHART */}
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 group">
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-50 tracking-tight">
            Activity & Sleep
          </h3>
        </div>

        <div className="w-full h-64 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dx={10} />
              <YAxis yAxisId="workoutAxis" hide={true} domain={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.8)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(63, 63, 70, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
                formatter={(value, name) => {
                  if (name === "Workout (Yes/No)") return [value === 1 ? "Completed" : "Skipped", "Workout"];
                  return [value, name];
                }}
              />
              <Bar yAxisId="workoutAxis" dataKey="workout" name="Workout (Yes/No)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.3} />
              <Bar yAxisId="left" dataKey="steps" name="Steps" fill="url(#colorSteps)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="right" type="stepAfter" dataKey="sleep" name="Sleep (hrs)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, fill: "#18181b", stroke: "#8b5cf6", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
