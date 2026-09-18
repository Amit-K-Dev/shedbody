"use client";

import { useState, useEffect } from "react";
import { Plus, Activity, Loader2, Moon, Dumbbell, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function PremiumLogLifestyle({ recentLogs = [] }) {
  // 1. Calculate local date on mount (safe from server UTC mismatch)
  const [localLogDate, setLocalLogDate] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  // 2. Form state
  const [workoutStatus, setWorkoutStatus] = useState("null"); // "null", "true", "false"
  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setLocalLogDate(today);

    // Find today's existing log to hydrate UI
    const todayLog = recentLogs.find((log) => log.log_date === today);
    
    if (todayLog) {
      if (todayLog.workout_completed === true) setWorkoutStatus("true");
      else if (todayLog.workout_completed === false) setWorkoutStatus("false");
      else setWorkoutStatus("null");

      setSteps(todayLog.steps_count !== null ? String(todayLog.steps_count) : "");
      setSleep(todayLog.sleep_hours !== null ? String(todayLog.sleep_hours) : "");
    }
    setInitialLoad(false);
  }, [recentLogs]);

  async function handleLogLifestyle() {
    // Determine actual payload values
    const payloadWorkout = workoutStatus === "true" ? true : workoutStatus === "false" ? false : null;
    const payloadSteps = steps === "" ? null : Number(steps);
    const payloadSleep = sleep === "" ? null : Number(sleep);

    if (payloadWorkout === null && payloadSteps === null && payloadSleep === null) {
      toast.error("Please enter at least one value to log.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/lifestyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate: localLogDate,
          workoutCompleted: payloadWorkout,
          stepsCount: payloadSteps,
          sleepHours: payloadSleep,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.show({
        title: "Lifestyle logged!",
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to log lifestyle");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoad) {
    return (
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 h-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group transition-all hover:border-emerald-500/30">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
        
        {/* Left Side: Title */}
        <div className="flex items-start gap-4 xl:w-1/4">
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl shrink-0">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              Log Lifestyle
            </h3>
            <p className="text-sm text-zinc-400 mt-0.5">
              Track sleep, steps, and workouts.
            </p>
          </div>
        </div>

        {/* Right Side: Inputs & Action */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-3/4">
          
          {/* Workout Select */}
          <div className="relative flex-1 min-w-[140px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
               {workoutStatus === "true" ? (
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
               ) : workoutStatus === "false" ? (
                 <XCircle className="w-4 h-4 text-red-500" />
               ) : (
                 <Dumbbell className="w-4 h-4 text-zinc-500" />
               )}
            </div>
            <select
              value={workoutStatus}
              onChange={(e) => setWorkoutStatus(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 appearance-none rounded-xl pl-10 pr-4 py-3 outline-none transition-all cursor-pointer"
            >
              <option value="null">Not Tracked</option>
              <option value="true">Completed</option>
              <option value="false">Skipped</option>
            </select>
          </div>

          {/* Steps Input */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="number"
              placeholder="Steps"
              value={steps}
              min="0"
              step="1"
              onChange={(e) => setSteps(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogLifestyle()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium pointer-events-none">
              steps
            </span>
          </div>

          {/* Sleep Input */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="number"
              placeholder="Sleep"
              value={sleep}
              min="0"
              step="0.5"
              onChange={(e) => setSleep(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogLifestyle()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl pl-10 pr-4 py-3 outline-none transition-all"
            />
            <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium pointer-events-none">
              hrs
            </span>
          </div>

          {/* Save Button */}
          <button
            onClick={handleLogLifestyle}
            disabled={loading || (workoutStatus === "null" && steps === "" && sleep === "")}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] mt-2 xl:mt-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
