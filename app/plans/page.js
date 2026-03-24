"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PlanPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const saved = JSON.parse(localStorage.getItem("plans") || "[]");
      setPlans(saved);
    };
    loadData();
  }, []);

  const deletePlan = (index) => {
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
    localStorage.setItem("plans", JSON.stringify(updated));
  };

  const clearAllPlans = () => {
    localStorage.removeItem(plans);
    setPlans([]);
  };

  return (
    <div className="min-h-screen text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Saved Plans</h1>

        {/* CLEAR ALL BUTTON */}
        <button
          onClick={clearAllPlans}
          className="mb-4 bg-red-500 px-4 py-2 rounded cursor-pointer"
        >
          Clear All
        </button>

        {plans.map((plan, i) => (
          <div
            key={i}
            className="mb-6 border border-zinc-800 bg-zinc-900 p-4 rounded-xl shadow-md"
          >
            {/* GOAL */}
            <p>
              <strong>Goal:</strong>{" "}
              {plan.goal
                ? plan.goal.replace("_", " ").toUpperCase()
                : "UNKNOWN"}
            </p>
            <p className="mb-2">
              <strong>Diet Type:</strong>{" "}
              {plan.dietType
                ? plan.dietType.replace("_", " ").toUpperCase()
                : "UNKNOWN"}
            </p>
            <p className="mb-2">
              <strong>Level:</strong>{" "}
              {plan.level
                ? plan.level.replace("_", " ").toUpperCase()
                : "UNKNOWN"}
            </p>
            <p>
              <strong>Calories:</strong> {plan.calories} kcal
            </p>
            <p>
              <strong>Protein:</strong> {plan.protein} g/day
            </p>

            {/* WORKOUT */}
            <div className="mb-2">
              <h3 className="font-semibold text-lg mt-3 mb-2">Workout:</h3>
              <ul>
                {plan.workout?.map((d, idx) => (
                  <li key={idx}>&bull; {d}</li>
                ))}
              </ul>
            </div>

            {/* MEALS */}
            <div className="mb-2">
              <h3 className="font-semibold text-lg mt-3 mb-2">Meals:</h3>
              <p>
                🍳 <span className="font-semibold">Breakfast:</span>{" "}
                {plan.meals?.breakfast}
              </p>
              <p>
                🍛 <span className="font-semibold">Lunch:</span>{" "}
                {plan.meals?.lunch}
              </p>
              <p>
                🥗 <span className="font-semibold">Dinner:</span>{" "}
                {plan.meals?.dinner}
              </p>
              <p>
                🥤 <span className="font-semibold">Snacks:</span>{" "}
                {plan.meals?.snacks}
              </p>
            </div>

            {/* DELETE BUTTON (PER CARD) */}

            <button
              onClick={() => deletePlan(i)}
              className="mt-3 text-red-400 text-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 mt-4 mb-2">
          <Link
            href="/start"
            className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black font-semibold text-center shadow-lg shadow-green-500/20 cursor-pointer"
          >
            Generate Smart Plan
          </Link>
          <Link
            href="/progress"
            className="w-full px-6 py-3 rounded-lg bg-linear-to-r from-green-400 to-emerald-500 text-black font-semibold text-center shadow-lg shadow-green-500/20 cursor-pointer"
          >
            See Progress
          </Link>
        </div>
      </div>
    </div>
  );
}
