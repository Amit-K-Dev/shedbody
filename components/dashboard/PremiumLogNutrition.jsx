"use client";

import { useState, useEffect } from "react";
import { Plus, Utensils, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function PremiumLogNutrition({ recentLogs = [] }) {
  const [localLogDate, setLocalLogDate] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [water, setWater] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setLocalLogDate(today);

    // Find today's existing log to hydrate UI
    const todayLog = recentLogs.find((log) => log.log_date === today);

    if (todayLog) {
      setCalories(todayLog.calories_consumed !== null ? String(todayLog.calories_consumed) : "");
      setProtein(todayLog.protein_consumed !== null ? String(todayLog.protein_consumed) : "");
      setWater(todayLog.water_ml !== null ? String(todayLog.water_ml) : "");
    }
  }, [recentLogs]);

  async function handleLogNutrition() {
    // If all are empty, do nothing
    if (calories === "" && protein === "" && water === "") {
      toast.error("Please enter at least one value to log.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate: localLogDate,
          calories: calories === "" ? null : Number(calories),
          protein: protein === "" ? null : Number(protein),
          water: water === "" ? null : Number(water),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save");

      toast.show({
        title: "Nutrition logged!",
        variant: "success",
      });

      setCalories("");
      setProtein("");
      setWater("");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to log nutrition");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group transition-all hover:border-emerald-500/30">
      {/* Background Subtle Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl shrink-0">
            <Utensils className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              Log Today&apos;s Nutrition
            </h3>
            <p className="text-sm text-zinc-400 flex items-center gap-1 mt-0.5">
              Enter what you have consumed today.
            </p>
          </div>
        </div>

        {/* Right Side: Inputs & Action */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Calories Input */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="number"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogNutrition()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">
              kcal
            </span>
          </div>

          {/* Protein Input */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="number"
              placeholder="Protein"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogNutrition()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">
              g
            </span>
          </div>

          {/* Water Input */}
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="number"
              placeholder="Water"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogNutrition()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">
              ml
            </span>
          </div>

          {/* Save Button */}
          <button
            onClick={handleLogNutrition}
            disabled={loading || (calories === "" && protein === "" && water === "")}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] mt-2 sm:mt-0"
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
