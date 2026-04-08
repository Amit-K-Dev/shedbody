"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WeightChart({ data }) {
  const chartData = data.map((item) => ({
    date: new Date(item.created_at).toLocaleDateString(),
    weight: item.weight,
  }));

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
      <h3 className="mb-4 font-semibold text-zinc-50">Weight Progress</h3>

      <div className="h-64">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="weight" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
