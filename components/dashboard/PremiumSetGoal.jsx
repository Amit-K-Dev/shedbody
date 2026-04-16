"use client";

import { useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PremiumSetGoal({ currentTarget }) {
  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSetGoal() {
    if (!goalInput || isNaN(goalInput)) {
      toast.error("Please enter a valid target weight");
      return;
    }

    const targetWeight = parseFloat(goalInput);

    if (targetWeight <= 0 || targetWeight > 500) {
      toast.error("Please enter a realistic target weight");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      // Update target weight in Database
      const { data: updatedProfile, error } = await supabase
        .from("user_profiles")
        .update({ target_weight: targetWeight })
        .eq("user_id", user.id)
        .select("user_id")
        .maybeSingle();

      if (error) throw error;
      if (!updatedProfile) throw new Error("Profile not found");

      toast.show({
        title: "Target Goal Updated! 🎯",
        variant: "success",
      });

      setGoalInput("");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group transition-all hover:border-purple-500/30">
      {/* Background Subtle Glow */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              Update Target Weight
            </h3>
            <p className="text-sm text-zinc-400 flex items-center gap-1 mt-0.5">
              Current Target:{" "}
              <span className="text-zinc-50 font-medium">
                {currentTarget ? `${currentTarget} kg` : "--"}
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Input & Action */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <input
              type="number"
              placeholder="e.g. 70"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetGoal()}
              className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
              kg
            </span>
          </div>

          <button
            onClick={handleSetGoal}
            disabled={loading || !goalInput}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Update</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
