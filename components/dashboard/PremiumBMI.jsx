"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Activity } from "lucide-react";

export default function PremiumBMI({ bmiData }) {
  if (!bmiData || bmiData.length === 0) return null;

  const latestBMI = bmiData[bmiData.length - 1]?.bmi || 0;

  let categoryStr = "Normal";
  let colorTheme = "text-green-400 bg-green-400/10 border-green-400/20";
  let gradientColor = "#10b981";

  if (latestBMI < 18.5) {
    categoryStr = "Underweight";
    colorTheme = "text-blue-400 bg-blue-400/10 border-blue-400/20";
    gradientColor = "#3b82f6";
  } else if (latestBMI >= 25 && latestBMI < 30) {
    categoryStr = "Overweight";
    colorTheme = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    gradientColor = "#facc15";
  } else if (latestBMI >= 30) {
    categoryStr = "Obese";
    colorTheme = "text-orange-400 bg-orange-400/10 border-orange-400/20";
    gradientColor = "#f97316";
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group">
      {/* Background Glow */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10 transition-colors duration-700"
        style={{ backgroundColor: gradientColor }}
      ></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${colorTheme}`}>
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            BMI Trend
          </h3>
        </div>

        {/* Dynamic BMI Badge */}
        <div
          className={`px-3 py-1 rounded-full border text-sm font-bold flex items-center gap-2 ${colorTheme}`}
        >
          {latestBMI}{" "}
          <span className="font-medium text-xs opacity-80">{categoryStr}</span>
        </div>
      </div>

      <div className="w-full h-75 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={bmiData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBmiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
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
              domain={["dataMin - 1", "dataMax + 1"]}
              dx={-10}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(24, 24, 27, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(63, 63, 70, 0.5)",
                borderRadius: "12px",
                color: "#fff",
              }}
              itemStyle={{ color: gradientColor, fontWeight: "bold" }}
              formatter={(value) => [`${value}`, "BMI"]}
              labelStyle={{ color: "#a1a1aa", marginBottom: "4px" }}
            />

            <ReferenceLine
              y={25}
              stroke="#ef4444"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <ReferenceLine
              y={18.5}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              opacity={0.5}
            />

            <Area
              type="monotone"
              dataKey="bmi"
              stroke={gradientColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBmiGrad)"
              activeDot={{
                r: 6,
                fill: gradientColor,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
