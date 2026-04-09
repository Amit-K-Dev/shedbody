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
    date: new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: item.weight,
  }));

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
      <h3 className="mb-4 font-semibold text-zinc-50">Weight Progress</h3>

      <div className="h-75">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
                  weight: "Weight",
                };
                const label = lableMap[name] || name;
                return [`${value} kg`, label];
              }}
            />

            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8884d8"
              strokeWidth={3}
              strokeOpacity={0.3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
