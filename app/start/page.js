"use client";

import { useState } from "react";

export default function SartPlan() {
  const [goal, setGoal] = useState("fat_loss");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [result, setResult] = useState(null);

  const activityMultiplier = {
    low: 1.2,
    moderate: 1.55,
    high: 1.75,
  };

  // Generate Plan
  const generatePlan = () => {
    if (!weight || !height || !age) return;

    let bmr;

    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let maintenance = bmr * activityMultiplier[activity];

    let calories;
    if (goal === "fat_loss") calories = maintenance - 400;
    else if (goal === "muscle_gain") calories = maintenance + 300;
    else calories = maintenance;

    const workoutPlan = getWorkoutPlan(goal);
    const meals = generateMeals(calories);

    setResult({
      calories: Math.round(calories),
      protein: Math.round(weight * 2),
      workout: workoutPlan,
      meals,
    });
  };

  // Generate Workout Plan
  const getWorkoutPlan = (goal) => {
    if (goal === "fat_loss") {
      return [
        "Day 1: Upper Body",
        "Day 2: Lower Body",
        "Day 3: Cardio + Core",
        "Day 4: Upper Body",
        "Day 5: Lower Body",
        "Day 6: HIIT",
        "Day 7: Rest",
      ];
    }

    if (goal === "muscle_gain") {
      return [
        "Day 1: Chest + Triceps",
        "Day 2: Back + Bceps",
        "Day 3: Legs",
        "Day 4: Shoulders",
        "Day 5: Arms",
        "Day 6: Legs",
        "Day 7: Rest",
      ];
    }

    return [
      "Day 1: Full Body",
      "Day 2: Cardio",
      "Day 3: Full Body",
      "Day 4: Rest",
      "Day 5: Full Body",
      "Day 6: Light Cardio",
      "Day 7: Rest",
    ];
  };

  // Generate Meal Plans
  const generateMeals = (calories) => {
    return {
      breakfast: `${Math.round(calories * 0.25)} kcal - Oats + Milk + Fruits`,
      lunch: `${Math.round(calories * 0.35)} kcal - Rice + Chicken/Paneer + Veggies`,
      dinner: `${Math.round(calories * 0.25)} kcal - Roti + Dal + Salad`,
      snacks: `${Math.round(calories * 0.15)} kcal - Nuts + Protein Shake`,
    };
  };

  return (
    <div className="min-h-screen bg-black text-white text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Build Your Smart Fitness Plan
        </h1>
        <p className="text-gray-400 mb-8">
          Get a personalized workout & diet plan in seconds.
        </p>

        {/* GOAL */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["fat_loss", "muscle_gain", "maintenace"].map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`p-3 rounded-lg ${
                goal === g
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900 border border-zinc-700"
              }`}
            >
              {g.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* INPUTS */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <input
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="p-3 bg-zinc-900 rounded-lg"
          />

          <input
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="p-3 bg-zinc-900 rounded-lg"
          />

          <input
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="p-3 bg-zinc-900 rounded-lg"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="p-3 bg-zinc-900 rounded-lg"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full p-3 bg-zinc-900 rounded-lg mb-6"
          >
            <option value="low">Low Activity</option>
            <option value="moderate">Moderate Activity</option>
            <option value="high">High Activity</option>
          </select>
        </div>
        {/* BUTTON */}
        <div className="grid gap-3 mb-6 ">
          <button
            onClick={generatePlan}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-black font-bold"
          >
            Generate Smart Plan
          </button>

          {/* RESULT */}
          {result && (
            <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-700">
              <h2 className="text-xl font-bold mb-4">Your Plan</h2>

              <p>Calories: {result.calories} kcal</p>
              <p>Protein: {result.protein} g/day</p>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Workout Plan</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  {result.workout.map((day, i) => (
                    <li key={i}>&bull; {day}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Meal Plan */}
          {result && result.meals && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Meal PLan</h3>

              {result?.meals && (
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>🍳 Breakfast: {result.meals.breakfast}</li>
                  <li>🍛 Lunch: {result.meals.lunch}</li>
                  <li>🥗 Dinner: {result.meals.dinner}</li>
                  <li>🥤 Snacks: {result.meals.snacks}</li>
                </ul>
              )}
            </div>
          )}

          {/* Save Plan */}
          <button
            onClick={async () => {
              await fetch("/api/plan", {
                method: "POST",
                body: JSON.stringify(result),
              });
              alert("Plan Saved!");
            }}
            className="mt-4 w-full py-3 rounded-lg bg-green-500 text-black font-semibold"
          >
            Save PLan
          </button>
        </div>

        {/* RELATED CONTENT */}
        {result && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Recommended Reads</h3>

            <div className="space-y-2 text-green-400">
              {goal === "fat_loss" && (
                <>
                  <p>&bull; Best Fat Loss Exercises</p>
                  <p>&bull; High Protein Diet Guide</p>
                </>
              )}

              {goal === "muscle_gain" && (
                <>
                  <p>&bull; Muscle Building Workout Plan</p>
                  <p>&bull; Bulking Diet Strategy</p>
                </>
              )}

              {goal === "maintenace" && (
                <>
                  <p>&bull; Muscle Maintain Workout Plan</p>
                  <p>&bull; Maintain Diet Strategy</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
