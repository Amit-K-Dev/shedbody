"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function AddWeightForm() {
  const router = useRouter;
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!weight) return;

    setLoading(true);
    try {
      // Save weight
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weight }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // XP
      await fetch("/api/xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 20 }),
      });

      // Streak
      await fetch("/api/streak", {
        method: "POST",
      });

      // Success
      toast.success("Weight added 🚀");

      setWeight("");

      // realtime update
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="mb-4 font-semibold text-zinc-50">Add Weight</h3>

      <input
        type="number"
        placeholder="Enter weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 mb-4"
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full bg-emerald-500 text-black py-2 rounded-lg hover:bg-emerald-400 transition-transform duration-150 cursor-pointer"
      >
        {loading ? "Saving..." : "Add Entry"}
      </button>
    </div>
  );
}
