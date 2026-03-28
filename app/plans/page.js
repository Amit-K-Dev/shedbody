"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlans, savePlans } from "@/lib/storage";
import { X } from "lucide-react";

export default function PlanPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const saved = getPlans() || [];
        setPlans([...saved].reverse());
      } catch {
        setPlans([]);
      }
    };
    loadData();
  }, []);

  const deletePlan = (index) => {
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
    savePlans(updated);
  };

  const clearAllPlans = () => {
    savePlans([]);
    setPlans([]);
  };

  return (
    <section className="min-h-screen text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          My Saved Plans ({plans.length})
        </h1>

        {/* CLEAR ALL BUTTON */}
        <button
          onClick={() => {
            if (confirm("Delete all plans?")) clearAllPlans();
          }}
          className="mb-6 px-5 rounded-lg bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
        >
          Clear All Plans
        </button>

        {plans.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-400 mb-6">
              No plan yet. Generate one to get started.
            </p>

            <Link
              href="/start"
              className="px-6 py-3 bg-green-500 rounded-lg text-black font-semibold"
            >
              Generate Your First Plan
            </Link>
          </div>
        )}

        {plans.map((plan, i) => (
          <div
            key={plan.id || i}
            className="group mb-6 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-5 shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-between gap-2 text-gray-400">
                <p className="text-xs text-green-400 font-semibold tracking-wide">
                  {plan.goal
                    ? plan.goal.replace("_", " ").toUpperCase()
                    : "Unknown"}
                </p>
                <span>&bull;</span>
                <h3 className="text-sm text-green-400">
                  {plan.level.toUpperCase()}
                </h3>
                <span>&bull;</span>

                <p className="text-xs text-green-400 font-semibold tracking-wide">
                  {plan.dietType
                    ? plan.dietType.replace("_", " ").toUpperCase()
                    : "Unknown"}
                </p>
              </div>

              {/* DELETE ICON */}
              <button
                onClick={() => deletePlan(i)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Calories</p>
                <p className="text-lg font-bold text-white">
                  {plan.calories} kcal
                </p>
              </div>

              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Protein</p>
                <p className="text-lg font-bold text-white">{plan.protein} g</p>
              </div>
            </div>

            {/* WORKOUT */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Workout Plan
              </h4>
              <ul className="space-y-1 text-sm text-gray-400">
                {plan.workout?.map((d, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-400">&bull;</span> {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* MEALS */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Meals
              </h4>

              <div className="text-sm text-gray-400 space-y-1">
                <p>
                  🍳 <span className="font-semibold">Breakfast:</span>{" "}
                  {plan.meals?.breakfast || "Not set"}
                </p>
                <p>
                  🍛 <span className="font-semibold">Lunch:</span>{" "}
                  {plan.meals?.lunch || "Not set"}
                </p>
                <p>
                  🥗 <span className="font-semibold">Dinner:</span>{" "}
                  {plan.meals?.dinner || "Not set"}
                </p>
                <p>
                  🥤 <span className="font-semibold">Snacks:</span>{" "}
                  {plan.meals?.snacks || "Not set"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-4">
              <Link
                href="/start"
                className="flex-1 text-center py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold transition"
              >
                Reuse Plan
              </Link>

              <Link
                href="/progress"
                className="flex-1 text-center py-2 rounded-lg border border-zonc-700 hover:border-green-400 transition"
              >
                Track
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
