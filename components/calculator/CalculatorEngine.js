"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculatorMap } from "@/lib/calculations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Unified Color & Insight Helper
const getCategoryDetails = (category) => {
  const map = {
    Underweight: {
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      icon: "⚡",
      msg: "You may need to gain weight",
    },
    Normal: {
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: "🎯",
      msg: "You are in a healthy range",
    },
    Overweight: {
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      icon: "🔥",
      msg: "Consider improving your fitness",
    },
    Obese: {
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      icon: "⛑",
      msg: "Health risk is higher - take action",
    },
  };
  return map[category] || map["Obese"];
};

export default function CalculatorEngine({ config }) {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      const parsedInputs = {};
      for (let key in inputs) {
        parsedInputs[key] = parseFloat(inputs[key]) || 0;
      }

      const output = calculatorMap[config.slug](parsedInputs);
      setResult(output);

      if (user) {
        await saveResult(output, parsedInputs);
      }
    } catch (err) {
      console.error("Calculation error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async (resultData, inputData) => {
    const { error } = await supabase.from("calculator_results").insert([
      {
        user_id: user.id,
        calculator_id: config.id,
        input_data: inputData,
        result_data: resultData,
      },
    ]);
    if (!error) fetchHistory();
  };

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("calculator_results")
      .select("*")
      .eq("calculator_id", config.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7);

    setHistory(data || []);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const chartData = [...history].reverse().map((item) => ({
    date: new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    bmi: item.result_data?.bmi,
  }));

  const trend =
    history.length > 1
      ? (history[0].result_data.bmi - history[1].result_data.bmi).toFixed(1)
      : 0;
  const details = result ? getCategoryDetails(result.category) : null;

  return (
    <div className="max-w-md mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">
        {config.name}
      </h2>

      {/* Inputs */}
      <div className="space-y-4 mb-6">
        {config.inputs.map((input) => (
          <div key={input.key}>
            <label className="text-xs uppercase tracking-widest text-zinc-500 ml-1 mb-1 block font-bold">
              {input.label}
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder={`Enter ${input.label.toLowerCase()}`}
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-white"
              onChange={(e) => handleChange(input.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 text-black font-bold py-4 rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-500/10"
      >
        {loading ? "Analyzing..." : "Calculate BMI"}
      </button>

      {/* Result Card */}
      {result && details && (
        <div className="mt-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-5xl font-black text-white tracking-tighter">
            {result.bmi}
          </p>
          <div
            className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${details.color}`}
          >
            {result.category}
          </div>
          <p className="mt-4 text-zinc-400 text-sm">
            {details.msg} {details.icon}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-6 text-[10px] font-bold">
            <span className="p-2 rounded-lg bg-blue-500/5 text-blue-500 border border-blue-500/10">
              UNDER &lt; 18.5
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
              NORMAL 18.5-25
            </span>
            <span className="p-2 rounded-lg bg-yellow-500/5 text-yellow-500 border border-yellow-500/10">
              OVER 25-30
            </span>
            <span className="p-2 rounded-lg bg-red-500/5 text-red-500 border border-red-500/10">
              OBESE 30+
            </span>
          </div>
        </div>
      )}

      {/* Modern Progress Chart */}
      {user && history.length > 1 && (
        <div className="mt-10 pt-8 border-t border-zinc-800">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-lg font-bold text-white">Progress Path</h3>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${trend <= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}
            >
              {trend <= 0 ? "📉 Down" : "📈 Up"} {Math.abs(trend)}
            </span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis dataKey="date" hide />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                />
                <Line
                  type="stepAfter"
                  dataKey="bmi"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
