"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlans, deletePlan, clearAllPlans } from "@/lib/storage";
import {
  X,
  Apple,
  CalendarDays,
  Egg,
  Moon,
  Utensils,
  Flame,
  Dumbbell,
  Trash2,
  Sparkles,
} from "lucide-react";

export default function PlanPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPlans() {
    setLoading(true);
    const data = await getPlans();
    setPlans(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  // DELETE
  async function handleDelete(id) {
    await deletePlan(id);
    loadPlans();
  }

  // CLEAR ALL
  async function handleClearAll() {
    if (
      confirm(
        "Are you sure you want to delete all saved plans? This action cannot be undone.",
      )
    ) {
      await clearAllPlans();
      setPlans([]);
    }
  }

  return (
    <section className="min-h-screen text-zinc-50 px-4 py-10 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-50 flex items-center gap-3">
              My Saved Plans
              <span className="bg-emerald-500/10 text-emerald-400 text-sm py-1 px-3 rounded-full border border-emerald-500/20">
                {plans.length} Total
              </span>
            </h1>
            <p className="text-zinc-400 mt-2">
              Access and track your generated fitness routines.
            </p>
          </div>

          {/* CLEAR ALL BUTTON */}
          {plans.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-zinc-50 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-semibold text-sm">Clear All Plans</span>
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && plans.length === 0 && (
          <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-12 text-center group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="p-5 bg-zinc-800/50 rounded-2xl mb-6 shadow-inner">
                <Sparkles className="w-10 h-10 text-emerald-400 opacity-80" />
              </div>
              <h2 className="text-xl font-bold text-zinc-50 mb-2">
                No Plans Yet
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md">
                You haven't saved any workout or diet plans yet. Generate your
                first smart plan to kickstart your journey.
              </p>

              <Link
                href="/start"
                className="px-8 py-3.5 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1"
              >
                Generate First Plan
              </Link>
            </div>
          </div>
        )}

        {/* GRID LIST */}
        {!loading && plans.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`group relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border ${
                  plan.is_active
                    ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    : "border-zinc-800/60 hover:border-emerald-500/30"
                } rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.15)] flex flex-col`}
              >
                {/* Subtle Background Glow */}
                <div
                  className={`absolute -right-20 -top-20 w-40 h-40 ${plan.is_active ? "bg-emerald-500/20" : "bg-emerald-500/10"} rounded-full blur-3xl pointer-events-none transition-colors duration-700`}
                ></div>

                {/* HEADER (Tags & Delete) */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    {plan.is_active && (
                      <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" /> CURRENT ACTIVE
                      </span>
                    )}

                    <span className="px-3 py-1 bg-zinc-800/80 border border-zinc-700 text-xs font-bold text-zinc-50 rounded-md">
                      {plan.goal
                        ? plan.goal.replace("_", " ").toUpperCase()
                        : "UNKNOWN"}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 rounded-md">
                      {plan.level.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 rounded-md">
                      {plan.diet_type
                        ? plan.diet_type.replace("_", " ").toUpperCase()
                        : "UNKNOWN"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(plan.id)}
                    className={`p-2 rounded-lg transition-colors ${plan.is_active ? "opacity-20 cursor-not-allowed" : "text-zinc-500 hover:text-red-400 hover:bg-red-400/10"}`}
                    disabled={plan.is_active}
                    title={
                      plan.is_active
                        ? "Cannot delete active plan"
                        : "Delete Plan"
                    }
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                  <div className="bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium">
                        Calories
                      </p>
                      <p className="text-lg font-black text-zinc-50">
                        {plan.calories}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          kcal
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Dumbbell className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium">
                        Protein
                      </p>
                      <p className="text-lg font-black text-zinc-50">
                        {plan.protein}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          g
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTENT AREA (Split 50/50 for Workout and Meals) */}
                <div className="grid md:grid-cols-2 gap-4 flex-1 relative z-10 mb-6">
                  {/* WORKOUT */}
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
                    <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-zinc-400" /> Workout
                    </h4>
                    <ul className="space-y-2.5">
                      {plan.workout?.slice(0, 6).map((d, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-zinc-300 flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                          <span className="line-clamp-2">{d}</span>
                        </li>
                      ))}
                      {plan.workout?.length > 6 && (
                        <li className="text-xs text-emerald-400 font-medium italic">
                          + more days...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* MEALS */}
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
                    <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-3 flex items-center gap-2">
                      <Apple className="w-4 h-4 text-zinc-400" /> Meals
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-sm">
                        <Egg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-zinc-300 line-clamp-1">
                            {plan.meals?.breakfast || "--"}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Utensils className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-zinc-300 line-clamp-1">
                            {plan.meals?.lunch || "--"}
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <Moon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-zinc-300 line-clamp-1">
                            {plan.meals?.dinner || "--"}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-auto relative z-10 pt-2 border-t border-zinc-800/50">
                  <Link
                    href="/start"
                    className="flex-1 text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all"
                  >
                    Generate New
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex-1 text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-50 font-bold transition-all border border-zinc-700"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
