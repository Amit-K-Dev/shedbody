"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlans, deletePlan, clearAllPlans } from "@/lib/storage";
import { X, Apple, CalendarDays, Egg, Moon, Utensils } from "lucide-react";

export default function PlanPage() {
  const [plans, setPlans] = useState([]);

  async function loadPlans() {
    const data = await getPlans();

    setPlans(data);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  // DELETE
  async function handleDelete(id) {
    await deletePlan(id);
    loadPlans(); // refresh
  }

  // CLEAR ALL
  async function handleClearAll() {
    if (confirm("Delete all plans?")) {
      await clearAllPlans();
      setPlans([]);
    }
  }

  return (
    <section className="min-h-screen text-white px-4 py-10 pb-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          My Saved Plans ({plans.length})
        </h1>

        {/* CLEAR ALL BUTTON */}
        {plans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="mb-6 px-5 py-2 rounded-lg bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
          >
            Clear All Plans
          </button>
        )}

        {/* EMPTY */}
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

        {/* LIST */}
        {plans.map((plan) => (
          <div
            key={plan.id}
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
                <p className="text-sm text-green-400 font-semibold tracking-wide">
                  {plan.level.toUpperCase()}
                </p>
                <span>&bull;</span>

                <p className="text-xs text-green-400 font-semibold tracking-wide">
                  {plan.diet_type
                    ? plan.diet_type.replace("_", " ").toUpperCase()
                    : "Unknown"}
                </p>
              </div>

              {/* DELETE ICON */}
              <button
                onClick={() => handleDelete(plan.id)}
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
              <ul className="space-y-2 text-sm text-gray-400">
                {plan.workout?.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 mt-0.5" />
                    <div>{d}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* MEALS */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">
                Meals
              </h4>

              <ul className="text-sm space-y-3">
                <li className="flex items-start gap-2">
                  <Egg className="w-4 h-4 mt-0.5 text-yellow-400" />
                  <div>
                    <span className="font-medium text-gray-200">
                      Breakfast:
                    </span>{" "}
                    <span className="text-gray-400">
                      {plan.meals?.breakfast || "Not set"}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Utensils className="w-4 h-4 mt-0.5 text-orange-400" />
                  <div>
                    <span className="font-medium text-gray-200">Lunch:</span>{" "}
                    <span className="text-gray-400">
                      {plan.meals?.lunch || "Not set"}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Moon className="w-4 h-4 mt-0.5 text-blue-400" />
                  <div>
                    <span className="font-medium text-gray-200">Dinner:</span>{" "}
                    <span className="text-gray-400">
                      {plan.meals?.dinner || "Not set"}
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Apple className="w-4 h-4 mt-0.5 text-green-400" />
                  <div>
                    <span className="font-medium text-gray-200">Snacks:</span>{" "}
                    <span className="text-gray-400">
                      {plan.meals?.snacks || "Not set"}
                    </span>
                  </div>
                </li>
              </ul>
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
