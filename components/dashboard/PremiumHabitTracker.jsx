"use strict";
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const HABIT_ICONS = {
  workout: "🏋️",
  steps: "👟",
  water: "💧",
  sleep: "🌙",
  protein: "🥩",
  meditation: "🧘"
};

const HABIT_LABELS = {
  workout: "Workout",
  steps: "Steps",
  water: "Water",
  sleep: "Sleep",
  protein: "Protein",
  meditation: "Meditation"
};

export default function PremiumHabitTracker({ todayHabits = {} }) {
  const router = useRouter();
  const [loadingHabit, setLoadingHabit] = useState(null);

  // Local state for optimistic updates
  const [habits, setHabits] = useState(todayHabits);

  const toggleHabit = async (habitName, currentStatus) => {
    const newStatus = !currentStatus;
    setLoadingHabit(habitName);
    
    // Optimistic update
    setHabits(prev => ({ ...prev, [habitName]: newStatus }));

    try {
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate: localDate,
          habitName: habitName,
          completed: newStatus
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update habit");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update habit");
      // Revert optimistic update
      setHabits(prev => ({ ...prev, [habitName]: currentStatus }));
    } finally {
      setLoadingHabit(null);
    }
  };

  const habitKeys = Object.keys(HABIT_LABELS);
  const completedCount = habitKeys.filter(key => habits[key]).length;
  const progress = Math.round((completedCount / habitKeys.length) * 100);

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 transition-all hover:border-emerald-500/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
            Daily Habits
          </h3>
          <p className="text-sm text-zinc-400 mt-0.5">
            {completedCount} of {habitKeys.length} completed
          </p>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              className="text-zinc-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="24"
              cy="24"
            />
            <circle
              className="text-emerald-500 transition-all duration-500"
              strokeWidth="4"
              strokeDasharray={20 * 2 * Math.PI}
              strokeDashoffset={20 * 2 * Math.PI - (progress / 100) * 20 * 2 * Math.PI}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="24"
              cy="24"
            />
          </svg>
          {progress === 100 && (
            <Sparkles className="absolute w-4 h-4 text-emerald-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {habitKeys.map(key => {
          const isCompleted = habits[key] || false;
          const isLoading = loadingHabit === key;

          return (
            <button
              key={key}
              onClick={() => toggleHabit(key, isCompleted)}
              disabled={isLoading}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isCompleted 
                  ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" 
                  : "bg-zinc-950/50 border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900"
              }`}
            >
              <div className="shrink-0">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              <div>
                <span className="block text-sm font-semibold text-zinc-200">
                  {HABIT_LABELS[key]}
                </span>
                <span className="block text-xs text-zinc-500">
                  {HABIT_ICONS[key]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
