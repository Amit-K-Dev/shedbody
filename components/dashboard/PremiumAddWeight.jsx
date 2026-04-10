"use client";

import { useState } from "react";
import { Plus, Scale, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function PremiumAddWeight({ lastWeight }) {
  const [weightInput, setWeightInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAddWeight() {
    if (!weightInput || isNaN(weightInput)) {
      toast.error("Please enter a valid weight");
      return;
    }

    setLoading(true);

    try {
      // Progress Table mein Entry
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: Number(weightInput) }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // The Gamification Magic! (XP & Streak)
      await fetch("/api/xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 20 }),
      });
      await fetch("/api/streak", { method: "POST" });

      toast.show({
        title: "Weight logged! +20 XP 🔥",
        variant: "success",
      });

      setWeightInput("");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to log weight");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group transition-all hover:border-emerald-500/30">
      {/* Background Subtle Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Title & Last Weight */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
            <Scale className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              Log Today's Weight
            </h3>
            <p className="text-sm text-zinc-400 flex items-center gap-1 mt-0.5">
              Last log:{" "}
              <span className="text-zinc-50 font-medium">
                {lastWeight ? `${lastWeight} kg` : "--"}
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Input & Action */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <input
              type="number"
              placeholder="e.g. 75.5"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
              kg
            </span>
          </div>

          <button
            onClick={handleAddWeight}
            disabled={loading || !weightInput}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
