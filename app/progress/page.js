"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";

const getAIFeedback = (data, goal) => {
  if (!data || data.length === 0) {
    return "Start tracking your weight to get AI insights.";
  }

  const latest = data[data.length - 1].weight;
  const previous = data[data.length - 2].weight;

  const diff = latest - previous;

  // FAT LOSS
  if (goal === "fat_loss") {
    if (diff > 0) return "⚠ You are gaining weight. Reduce calories slightly.";
    if (diff < -1) return "⚠ Losing too fast. Increase calories a bit.";
    if (diff < 0) return "✅ Perfect fat loss pace. Keep going.";
  }

  // MUSCLE GAIN
  if (goal === "muscle_gain") {
    if (diff < 0) return "⚠ Losing weight. Increase calories.";
    if (diff > 1) return "⚠ Gaining too fast (fat gain risk). Reduce slightly.";
    if (diff > 0) return "✅ Good muscle gain pace.";
  }

  // MAINTENANCE
  if (goal === "maintenance") {
    if (Math.abs(diff) < 0.5) return "✅ Weight stable. Perfect maintenance.";
    return "⚠ Weight fluctuating. Adjust slightly.";
  }
  return "Keep tracking your progress.";
};

// Get Weekly Smoothed Data
function getWeeklySmoothedData(data) {
  if (data.length === 0) return [];

  const smoothed = [];

  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;

    // Last 7 days entries (or fewer if not available)
    for (let j = i; j > i - 7 && j >= 0; j--) {
      sum += data[j].weight;
      count++;
    }

    smoothed.push({
      ...data[i],
      smoothWeight: +(sum / count).toFixed(1),
    });
  }
  return smoothed;
}

// Custom Tool Tip

export default function ProgressPage() {
  const [data, setData] = useState([]);
  const [goal, setGoal] = useState("fat_loss");
  const [goalWeight, setGoalWeight] = useState(65);

  useEffect(() => {
    const loadData = () => {
      const savedProgress = JSON.parse(
        localStorage.getItem("progress") || "[]",
      );
      setData(savedProgress);

      // Get Goal
      const userProfile = JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem("userProfile") || "{}"
          : "{}",
      );
      setGoal(userProfile.goal || "fat_loss");
      setGoalWeight(userProfile.targetWeight || 65);
    };

    loadData();
  }, []);

  const feedback = getAIFeedback(data, goal);
  const isFatloss = goal === "fat_loss";
  const lineColor = isFatloss ? "#22c55e" : "#3b82f6";

  const chartData = data
    .map((item) => {
      if (!item.date || !item.weight) return null;

      const dateObj = new Date(item.date);

      if (isNaN(dateObj)) return null;

      return {
        dateObj,
        weight: Number(item.weight),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.dateObj - b.dateObj)
    .map((item) => ({
      date: item.dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      weight: item.weight,
    }));

  const smoothedData = getWeeklySmoothedData(chartData);

  const trend =
    data.length >= 2 ? data[data.length - 1].weight - data[0].weight : 0;

  // Prediction
  const prediction =
    data.length >= 2 ? data[data.length - 1].weight + trend : null;

  return (
    <div className="min-h-screen text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Progress</h1>

        {data.length < 2 && (
          <p className="text-gray-400 mb-4">
            Add more entries to see progress trend
          </p>
        )}

        {/* FEEDBACK */}
        <div className="mb-4 p-4 rounded-lg bg-zinc-900 border border-zinc-700">
          <h2 className="text-lg font-semibold mb-2">ShedBody Coach</h2>
          <p className="text-green-400">{feedback}</p>
        </div>

        {/* TREND */}
        <p className="text-sm text-gray-400 mb-2">
          Trend:{" "}
          {trend < 0
            ? "📉 Losing weight"
            : trend > 0
              ? "📈 Gaining weight"
              : "⚖ Stable"}
        </p>

        {/* PREDICTION */}
        {prediction && (
          <p className="text-xs text-gray-500 mb-2">
            Predicted next: {prediction.toFixed(1)} kg
          </p>
        )}

        {/* CHART */}
        {chartData.length >= 2 && (
          <div className="w-full h-75 mb-6 bg-zinc-900 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-2">
              Weight Progress Over Time
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={smoothedData}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" domain={["dataMin - 2", "dataMax + 2"]} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #333",
                    borderRadius: "10px",
                  }}
                  labelStyle={{ color: "#aaa" }}
                  formatter={(value, name) => {
                    const label =
                      name === "smoothWeight"
                        ? "🔥 Trend"
                        : name === "weight"
                          ? "Weight"
                          : name;
                    return [`${value} kg`, label];
                  }}
                />

                {/* Goal Line */}
                <ReferenceLine
                  y={goalWeight}
                  stroke="#facc15"
                  strokeDasharray="5 5"
                  label="Goal"
                />

                <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                {/* Weight Line */}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#8884d8"
                  strokeWidth={1.5}
                  strokeOpacity={0.3}
                  dot={false}
                />

                {/* Smooth Weight Line */}
                <Line
                  type="monotone"
                  dataKey="smoothWeight"
                  stroke={lineColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22c55e" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ENTRIES */}
        {data.map((item, i) => (
          <div
            key={i}
            className="mb-2 bg-zinc-900 border border-zinc-700 p-3 rounded-lg"
          >
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(item.date).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Weight:</span> {item.weight} kg
            </p>
          </div>
        ))}

        <div className="flex gap-3 mt-8 mb-2">
          <Link
            href="/start"
            className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black font-semibold text-center shadow-lg shadow-green-500/20 cursor-pointer"
          >
            Add More Entries
          </Link>
          <Link
            href="/plans"
            className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black font-semibold text-center shadow-lg shadow-green-500/20 cursor-pointer"
          >
            My Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
