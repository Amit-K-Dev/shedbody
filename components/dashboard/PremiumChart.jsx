"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { LineChart as ChartIcon } from "lucide-react";

export default function PremiumChart({ weightData, goalWeight }) {
  // Data Formatting
  const chartData = (weightData || [])
    .map((item) => {
      if (!item.created_at || item.weight === null) return null;
      const dateObj = new Date(item.created_at);
      if (isNaN(dateObj)) return null;

      return {
        dateObj,
        weight: Number(item.weight),
        date: dateObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.dateObj - b.dateObj);

  //Empty State
  if (chartData.length === 0) {
    return (
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center min-h-75">
        <ChartIcon className="w-12 h-12 text-zinc-600 mb-3 opacity-50" />
        <p className="text-zinc-400 font-medium">
          Log your first weight to see the magic happen.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group">
      {/* Subtle Background Glow */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700"></div>

      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <ChartIcon className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-50 tracking-tight">
          Weight Progress
        </h3>
      </div>

      {/* CHARTS*/}
      <div className="w-full h-75 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* Custom SVG Gradient for the Line */}
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 2", "dataMax + 2"]}
              dx={-10}
            />

            {/* Premium Glassmorphism Tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(24, 24, 27, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(63, 63, 70, 0.5)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                color: "#fff",
              }}
              itemStyle={{ color: "#10b981", fontWeight: "bold" }}
              formatter={(value) => [`${value} kg`, "Weight"]}
              labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
            />

            {/* Goal Line */}
            {goalWeight && (
              <ReferenceLine
                y={goalWeight}
                stroke="#facc15"
                strokeDasharray="4 4"
                label={{
                  position: "top",
                  value: "🎯 Goal",
                  fill: "#facc15",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            )}

            {/* The Main Glowing Line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="url(#colorWeight)"
              strokeWidth={4}
              dot={{ r: 4, fill: "#18181b", stroke: "#10b981", strokeWidth: 2 }}
              activeDot={{
                r: 6,
                fill: "#10b981",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
