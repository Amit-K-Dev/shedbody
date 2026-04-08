"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SetGoal({ currentGoal }) {
  const [goal, setGoal] = useState(currentGoal || "");

  const supabase = createClient();

  const saveGoal = async () => {
    const { data } = await supabase.auth.getUser();

    await supabase
      .from("user_profiles")
      .update({ target_weight: parseFloat(goal) })
      .eq("id", data.user.id);

    alert("Goal updated");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="mb-4 font-semibold text-zinc-50">Set Goal</h3>

      <input
        type="number"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="w-full p-3 bg-zinc-800 rounded-lg mb-4"
      />

      <button
        onClick={saveGoal}
        className="w-full p-3 bg-emerald-500 text-black py-2 rounded-lg cursor-pointer hover:bg-emerald-400"
      >
        Save Goal
      </button>
    </div>
  );
}
