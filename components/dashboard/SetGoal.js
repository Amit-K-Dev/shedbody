"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export default function SetGoal({ currentGoal }) {
  const [goal, setGoal] = useState(currentGoal || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const saveGoal = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("User not found");

      // Check profile
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let dbError;

      if (existingProfile) {
        // UPDATE
        const { error } = await supabase
          .from("user_profiles")
          .update({ target_weight: parseFloat(goal) })
          .eq("user_id", user.id);
        dbError = error;
      } else {
        // INSERT (Create)
        const { error } = await supabase.from("user_profiles").insert([
          {
            user_id: user.id,
            target_weight: parseFloat(goal),
            goal: "Lose Weight",
            xp: 0,
            gamification_level: 1,
            streak_count: 1,
          },
        ]);
        dbError = error;
      }

      if (dbError) throw dbError;

      toast.show({
        title: "Goal updated successfully! 🎯",
        variant: "success",
      });

      router.refresh();
    } catch (error) {
      console.error("Error saving goal:", error);

      toast.error("Something went wrong while saving the goal.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="mb-4 font-semibold text-zinc-50">Set Goal</h3>

      <input
        type="number"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="w-full p-3 bg-zinc-800 rounded-lg mb-4 text-white"
        placeholder="Enter target weight..."
      />

      <button
        onClick={saveGoal}
        disabled={isSaving}
        className="w-full p-3 bg-emerald-500 text-black font-bold py-2 rounded-lg cursor-pointer hover:bg-emerald-400 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Save Goal"}
      </button>
    </div>
  );
}
