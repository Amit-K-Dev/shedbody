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
  Sun,
  Coffee,
  Bed,
  Info,
  Target,
} from "lucide-react";

// ICON & COLOR MAP FOR V2
const iconMap = {
  sun: Sun,
  apple: Apple,
  utensils: Utensils,
  coffee: Coffee,
  dumbbell: Dumbbell,
  moon: Moon,
  bed: Bed,
  info: Info,
};

const colorMap = {
  yellow: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
  green: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  orange: "text-orange-400 bg-orange-400/10 border border-orange-400/20",
  purple: "text-purple-400 bg-purple-400/10 border border-purple-400/20",
  red: "text-red-400 bg-red-400/10 border border-red-400/20",
  blue: "text-blue-400 bg-blue-400/10 border border-blue-400/20",
  indigo: "text-indigo-400 bg-indigo-400/10 border border-indigo-400/20",
  gray: "text-zinc-400 bg-zinc-800 border border-zinc-700",
};

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

        {/* EMPTY STATE (Premium Look) */}
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
          <div className="grid lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`group relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border ${
                  plan.is_active
                    ? "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    : "border-zinc-800/60 hover:border-emerald-500/30"
                } rounded-2xl p-5 md:p-6 transition-all duration-500 flex flex-col`}
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

                {/* V2 CONTENT AREA (Workout + Full Meals) */}
                <div className="grid grid-cols-1 gap-4 flex-1 relative z-10 mb-6">
                  {/* WORKOUT (SMART V1 & V2 RENDER) */}
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30 h-fit">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <h4 className="text-xs font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {plan.workout?.protocol_name || "Workout Protocol"}
                      </h4>
                      {/* V2 Protocol Badge */}
                      {plan.workout?.protocol_name && (
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Elite V2
                        </span>
                      )}
                    </div>

                    <ul className="space-y-5">
                      {/* SMART CHECK: V2 Object (Schedule) vs V1 Array */}
                      {plan.workout?.schedule ? (
                        // V2 RENDER LOGIC
                        plan.workout.schedule.map((dayData, idx) => (
                          <li
                            key={idx}
                            className="border-b border-zinc-700/50 pb-5 last:border-0 last:pb-0"
                          >
                            {/* Day Header */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-sm shrink-0">
                                DAY {dayData.day}
                              </span>
                              <span className="text-[13px] font-bold text-zinc-100 uppercase tracking-wide">
                                {dayData.title}
                              </span>
                            </div>

                            {/* Target Muscles Tags */}
                            {dayData.target_muscles && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {dayData.target_muscles.map((m, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-700/50 px-1.5 py-0.5 rounded-md"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Exercises Table View */}
                            <div className="space-y-2 mb-3">
                              {dayData.exercises?.map((ex) => (
                                <div
                                  key={ex.id}
                                  className="flex justify-between items-center gap-3 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/50 hover:border-emerald-500/30 transition-colors"
                                >
                                  <div className="flex-1">
                                    <p className="text-[11px] font-bold text-zinc-200">
                                      {ex.name}
                                    </p>
                                    {ex.technique && (
                                      <p className="text-[9px] text-emerald-400 mt-0.5 flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" />{" "}
                                        {ex.technique}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[11px] font-black text-zinc-50">
                                      {ex.sets}{" "}
                                      <span className="text-zinc-500 font-normal">
                                        x
                                      </span>{" "}
                                      {ex.reps}
                                    </p>
                                    <p className="text-[9px] font-medium text-zinc-500 mt-0.5">
                                      {ex.rest} rest
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Cardio Finisher Tag */}
                            {dayData.finisher_cardio &&
                              dayData.finisher_cardio.type !== "None" && (
                                <div className="text-[10px] text-orange-400 font-medium flex items-center justify-between bg-orange-400/10 p-2 rounded-lg border border-orange-400/20">
                                  <span className="flex items-center gap-1.5">
                                    <Flame className="w-3 h-3" /> Finisher:{" "}
                                    {dayData.finisher_cardio.type}
                                  </span>
                                  <span>
                                    {dayData.finisher_cardio.duration}
                                  </span>
                                </div>
                              )}
                          </li>
                        ))
                      ) : // V1 RENDER LOGIC (Fallback)
                      Array.isArray(plan.workout) ? (
                        plan.workout.map((d, idx) => (
                          <li
                            key={idx}
                            className="text-[13px] text-zinc-300 flex items-start gap-2 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{d}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic">
                          No workout protocol available.
                        </p>
                      )}
                    </ul>
                  </div>

                  {/* MEALS (FULL V2 RENDER) */}
                  <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30 h-fit">
                    <h4 className="text-xs font-bold tracking-wider text-emerald-400 uppercase mb-4 flex items-center gap-2">
                      <Apple className="w-4 h-4" /> Full Nutrition Plan
                    </h4>

                    {/* V2 Macros Render */}
                    {plan.meals?.macros && (
                      <div className="flex justify-between items-center bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-700/50 mb-4">
                        <div className="text-center flex-1">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">
                            Pro
                          </p>
                          <p className="text-sm font-black text-blue-400">
                            {plan.meals.macros.protein}g
                          </p>
                        </div>
                        <div className="text-center flex-1 border-x border-zinc-700/50">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">
                            Carb
                          </p>
                          <p className="text-sm font-black text-orange-400">
                            {plan.meals.macros.carbs}g
                          </p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">
                            Fat
                          </p>
                          <p className="text-sm font-black text-yellow-400">
                            {plan.meals.macros.fats}g
                          </p>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-4">
                      {/* SMART CHECK: V2 Array vs V1 Object */}
                      {plan.meals?.meals && Array.isArray(plan.meals.meals) ? (
                        plan.meals.meals.map((meal) => {
                          const IconComponent = iconMap[meal.icon] || Info;
                          const colorStyle =
                            colorMap[meal.color] || colorMap.gray;

                          return (
                            <li key={meal.id} className="flex gap-3">
                              <div
                                className={`p-2 rounded-lg shrink-0 flex items-center justify-center h-8 w-8 ${colorStyle}`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-zinc-200">
                                    {meal.name}
                                  </span>
                                  {meal.time && (
                                    <span className="text-[9px] text-zinc-500 font-medium">
                                      {meal.time}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-snug">
                                  {meal.items}
                                </p>
                              </div>
                            </li>
                          );
                        })
                      ) : (
                        /* V1 Fallback */
                        <>
                          <li className="flex items-start gap-2 text-sm">
                            <Egg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="block text-[10px] font-bold text-zinc-500 uppercase">
                                Breakfast
                              </span>
                              <span className="text-zinc-300 text-[11px]">
                                {plan.meals?.breakfast || "--"}
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Utensils className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="block text-[10px] font-bold text-zinc-500 uppercase">
                                Lunch
                              </span>
                              <span className="text-zinc-300 text-[11px]">
                                {plan.meals?.lunch || "--"}
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Moon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="block text-[10px] font-bold text-zinc-500 uppercase">
                                Dinner
                              </span>
                              <span className="text-zinc-300 text-[11px]">
                                {plan.meals?.dinner || "--"}
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Apple className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="block text-[10px] font-bold text-zinc-500 uppercase">
                                Snacks
                              </span>
                              <span className="text-zinc-300 text-[11px]">
                                {plan.meals?.snacks || "--"}
                              </span>
                            </div>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-auto relative z-10 pt-4 border-t border-zinc-800/50">
                  <Link
                    href="/start"
                    className="flex-1 text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all text-sm"
                  >
                    Generate New
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex-1 text-center py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-50 font-bold transition-all border border-zinc-700 text-sm"
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
