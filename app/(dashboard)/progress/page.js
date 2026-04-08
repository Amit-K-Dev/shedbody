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
import { getProgress, getUserProfile, addProgressEntry } from "@/lib/storage";

// ======= UTILS =======

const getAIFeedback = (data, goal) => {
  if (!data || data.length < 2) {
    return "Add more entries to unlock insights.";
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

export default function ProgressPage() {
  const [data, setData] = useState([]);
  const [goal, setGoal] = useState("fat_loss");
  const [goalWeight, setGoalWeight] = useState(65);

  const [weightInput, setWeightInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const progressData = await getProgress();
      setData(progressData);

      // Get Goal
      const profile = (await getUserProfile()) || {};
      setGoal(profile?.goal || "fat_loss");
      setGoalWeight(profile?.targetWeight || 65);
    }

    loadData();
  }, []);

  async function handleAddWeight() {
    if (!weightInput) return;

    setLoading(true);

    await addProgressEntry({
      weight: Number(weightInput),
    });

    setWeightInput("");

    // Reload data
    const updated = await getProgress();
    setData(updated);

    setLoading(false);
  }

  const chartData = data
    .map((item) => {
      if (!item.created_at || item.weight === null) return null;

      const dateObj = new Date(item.created_at);

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

  const feedback = getAIFeedback(smoothedData, goal);
  const isFatloss = goal === "fat_loss";
  const lineColor = isFatloss ? "#22c55e" : "#3b82f6";

  const extendedData = [...smoothedData];

  const last = smoothedData[smoothedData.length - 1]?.smoothWeight;
  const prev = smoothedData[smoothedData.length - 2]?.smoothWeight;

  const weeklyTrend = last && prev ? last - prev : 0;

  // Prediction
  const prediction = last != null ? Number(last) + weeklyTrend : null;

  if (prediction !== null) {
    const lastItem = smoothedData[smoothedData.length - 1];

    extendedData.push({
      date: "Next",
      smoothWeight: Number(prediction.toFixed(1)),
      weight: lastItem?.weight,
      isPrediction: true,
    });
  }

  return (
    <div className="min-h-screen text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Progress</h1>

        {data.length < 2 && (
          <p className="text-gray-400 mb-4">
            Add more entries to see progress trend
          </p>
        )}

        {/* CURRENT vs GOAL */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Current</p>
            <p className="texl-xl font-bold">{last || "--"} kg</p>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Target</p>
            <p className="text-xl font-bold">{goalWeight} kg</p>
          </div>
        </div>

        {/* ADD WEIGHT INPUT UI */}
        <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm text-gray-400 mb-2">Log Today's Weight</h3>
          <p className="text-sm text-gray-400 mb-2">
            Last: {data[data.length - 1]?.weight || "--"} kg
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 text-white outline-none"
            />

            <button
              onClick={handleAddWeight}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-black rounded-lg font-semibold"
            >
              {loading ? "Saving..." : "Add"}
            </button>
          </div>
        </div>

        {/* FEEDBACK */}
        <div className="mb-4 p-4 rounded-lg bg-zinc-900 border border-zinc-700">
          <h2 className="text-lg font-semibold mb-2">Coach</h2>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500">
            <p className="text-green-400 font-medium">{feedback}</p>
          </div>
        </div>

        {/* TREND */}
        <p className="text-sm text-gray-400 mb-2">
          Trend:{" "}
          {weeklyTrend < 0
            ? "📉 Losing weight"
            : weeklyTrend > 0
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
          <div className="w-full h-75 mb-6 bg-zinc-900 rounded-xl p-4 transition-all duration-300">
            <p className="text-sm text-gray-400 mb-2">
              Weight Progress Over Time
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={extendedData}>
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
                    const lableMap = {
                      smoothWeight: "🔥 Trend",
                      weight: "Weight",
                    };

                    const label = lableMap[name] || name;

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
                  dot={({ cx, cy, payload }) => {
                    const isPrediction = payload?.isPrediction;

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isPrediction ? 6 : 4}
                        fill={isPrediction ? "#22c55e" : "#8884d8"}
                      />
                    );
                  }}
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
              {new Date(item.created_at).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold">Weight:</span> {item.weight} kg
            </p>
          </div>
        ))}

        <div className="flex gap-3 mt-10 mb-2">
          <Link
            href="/start"
            className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black font-semibold text-center shadow-lg shadow-green-500/20 cursor-pointer"
          >
            Start New Plan
          </Link>
          <Link
            href="/plans"
            className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-zinc-900 to-zinc-800 text-white font-semibold text-center shadow-lg shadow-green-500/20 cursor-pointer border border-zinc-700 hover:border-green-400 transition"
          >
            My Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
