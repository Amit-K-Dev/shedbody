"use client";

import { useState } from "react";
import { dietPlans } from "@/data/diet";
import { workoutPlans } from "@/data/workout";
import Link from "next/link";
import { saveUserProfile, savePlan } from "@/lib/storage";
import { Apple, CalendarDays, Egg, Moon, Utensils } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function StartPlan() {
  const [goal, setGoal] = useState("fat_loss");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [result, setResult] = useState(null);
  const [dietType, setDietType] = useState("veg");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);

  const activityMultiplier = {
    low: 1.2,
    moderate: 1.55,
    high: 1.75,
  };

  const getBMICategory = (weight, height) => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  };

  const getSuggestedGoal = (bmiCategory) => {
    if (bmiCategory === "underweight") return "muscle_gain";
    if (bmiCategory === "normal") return "maintenance";
    return "fat_loss";
  };

  const getSuggestedLevel = (activity) => {
    if (activity === "low") return "beginner";
    if (activity === "moderate") return "intermediate";
    return "advanced";
  };

  const adjustCalories = (goal, currentCalories, progress = []) => {
    if (!progress || progress.length < 2) return currentCalories;
    const latest = progress[progress.length - 1].weight;
    const previous = progress[progress.length - 2].weight;
    const diff = latest - previous;

    if (goal === "fat_loss") {
      if (diff > 0) return currentCalories - 200;
      if (diff < -1) return currentCalories + 100;
    }

    if (goal === "muscle_gain") {
      if (diff < 0) return currentCalories + 200;
      if (diff > 1) return currentCalories - 100;
    }
    return currentCalories;
  };

  const generatePlan = () => {
    if (!weight || !height || !age) {
      toast.error("Please fill all fields");
      return;
    }

    if (weight < 30 || weight > 200) {
      toast.error("Enter valid weight");
      return;
    }

    if (height < 100 || height > 250) {
      toast.error("Enter valid height");
      return;
    }

    if (age < 10 || age > 80) {
      toast.error("Enter valid age");
      return;
    }

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

    const bmiCategory = getBMICategory(weight, height);
    const suggestedGoal = getSuggestedGoal(bmiCategory);
    const suggestedLevel = getSuggestedLevel(activity);

    const finalGoal = goal || suggestedGoal;
    const finalLevel = level || suggestedLevel;

    const adjustedCalories = adjustCalories(finalGoal, calories, []);

    const workout = workoutPlans[finalGoal]?.[finalLevel] || [];
    const availableCalories = Object.keys(dietPlans[finalGoal] || {}).map(
      Number,
    );

    const closest = availableCalories.length
      ? availableCalories.reduce((prev, curr) =>
          Math.abs(curr - adjustedCalories) < Math.abs(prev - adjustedCalories)
            ? curr
            : prev,
        )
      : null;

    let diet = null;
    if (closest) {
      diet =
        dietPlans[finalGoal]?.[closest]?.[dietType] ||
        dietPlans[finalGoal]?.[closest]?.veg ||
        null;
    }

    setResult({
      goal: finalGoal,
      level: finalLevel,
      dietType,
      calories: Math.round(adjustedCalories),
      protein: Math.round(weight * 2),
      workout,
      meals: diet,
    });
  };

  const handleSavePlan = async () => {
    if (!result) return;
    setLoading(true);

    try {
      // Profile Upsert (Create/Update)
      await saveUserProfile({
        weight,
        height,
        age,
        goal,
        level,
        diet_type: dietType,
        target_weight: weight,
        xp: 0,
        gamification_level: 1,
        streak_count: 1,
      });

      // Save Plan
      await savePlan(result);

      toast.show({ title: "Smart Plan Saved! 🎯", variant: "success" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-zinc-50 px-4 py-10 pb-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Build Your Smart Fitness Plan
        </h1>
        <p className="text-zinc-400 mb-6">
          Get a personalized workout & diet plan in seconds.
        </p>
        <div className="flex gap-3 mb-6">
          <Link
            href="/plans"
            className="text-sm text-emerald-400 cursor-pointer hover:text-emerald-300 transition"
          >
            My Plans
          </Link>
          <span className="text-gray-400">&bull;</span>
          <Link
            href="/progress"
            className="text-sm text-emerald-400 cursor-pointer hover:text-emerald-300 transition"
          >
            My Progress
          </Link>
        </div>

        {/* GOAL */}
        <div className="flex gap-3 mb-6">
          {["fat_loss", "muscle_gain", "maintenance"].map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`p-2 rounded-lg cursor-pointer flex-1 ${
                goal === g
                  ? "bg-emerald-400 text-black hover:bg-emerald-300 transition font-semibold"
                  : "bg-zinc-900 border border-zinc-700 hover:border-emerald-400 transition"
              }`}
            >
              {g.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* LEVEL */}
        <div className="flex gap-3 mb-6">
          {["beginner", "intermediate", "advanced"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`p-2 rounded-lg cursor-pointer flex-1 ${
                level === lvl
                  ? "bg-emerald-400 text-black hover:bg-emerald-300 transition font-semibold"
                  : "bg-zinc-900 border border-zinc-700 hover:border-emerald-300 transition"
              }`}
            >
              {lvl.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* INPUTS */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <input
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="p-3 bg-zinc-900 rounded-lg outline-none focus:border focus:border-emerald-400 transition"
          />

          <input
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="p-3 bg-zinc-900 rounded-lg outline-none focus:border focus:border-emerald-400 transition"
          />

          <input
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="p-3 bg-zinc-900 rounded-lg outline-none focus:border focus:border-emerald-400 transition"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="p-3 bg-zinc-900 rounded-lg outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full p-3 bg-zinc-900 rounded-lg mb-6 md:col-span-2 outline-none"
          >
            <option value="low">Low Activity</option>
            <option value="moderate">Moderate Activity</option>
            <option value="high">High Activity</option>
          </select>
        </div>

        {/* DIET TYPE */}
        <div className="flex gap-2 mt-2 mb-4">
          <button
            onClick={() => setDietType("veg")}
            className={
              dietType === "veg"
                ? "font-semibold rounded-lg bg-emerald-500 text-black py-2 w-full cursor-pointer"
                : "font-semibold rounded-lg bg-zinc-900 py-2 w-full border border-zinc-700 cursor-pointer hover:border-emerald-400 transition"
            }
          >
            Veg
          </button>
          <button
            onClick={() => setDietType("nonVeg")}
            className={
              dietType === "nonVeg"
                ? "font-semibold rounded-lg bg-emerald-500 text-black py-2 w-full cursor-pointer"
                : "font-semibold rounded-lg bg-zinc-900 py-2 w-full border border-zinc-700 cursor-pointer hover:border-emerald-400 transition"
            }
          >
            Non-Veg
          </button>
        </div>

        {/* Generate Plan */}
        <button
          onClick={generatePlan}
          className="w-full py-3 rounded-lg bg-linear-to-r from-emerald-400 to-emerald-600 text-black font-bold cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20"
        >
          Generate Smart Plan
        </button>

        {/* RESULT */}
        {result && (
          <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm text-emerald-400 mb-3">
              Suggestion: {result.goal.replace("_", " ").toUpperCase()} &bull;{" "}
              {result.level.toUpperCase()}
            </p>

            <h2 className="text-xl font-bold mb-4">Your Plan</h2>

            <p>
              <strong>Goal:</strong>{" "}
              {result.goal
                ? result.goal.replace("_", " ").toUpperCase()
                : "UNKNOWN"}
            </p>
            <p className="mb-2">
              <strong>Diet Type:</strong>{" "}
              {result.dietType
                ? result.dietType.replace("_", " ").toUpperCase()
                : "UNKNOWN"}
            </p>
            <p className="mb-2">
              <strong>Level:</strong>{" "}
              {result.level
                ? result.level.replace("_", " ").toUpperCase()
                : "UNKNOWN"}
            </p>
            <p>
              <strong>Calories:</strong>{" "}
              <span className="text-emerald-400">{result.calories} kcal</span>
            </p>
            <p>
              <strong>Protein:</strong>{" "}
              <span className="text-emerald-400">{result.protein} g/day</span>
            </p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Workout Plan</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                {result.workout?.map((day, i) => (
                  <li key={i} className="flex items-start gap-2 ">
                    <CalendarDays className="w-4 h-4 mt-0.5 text-gray-400" />
                    <div>{day}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Meal Plan */}
        {result && result.meals && (
          <div className="mt-4 p-6 bg-zinc-900 rounded-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <h3 className="font-semibold mb-4">Meal Plan</h3>
            <ul className="text-sm space-y-4">
              <li className="flex items-start gap-3">
                <Egg className="w-5 h-5 mt-0.5 text-yellow-400" />
                <div>
                  <span className="font-medium text-zinc-200 block mb-1">
                    Breakfast
                  </span>
                  <span className="text-zinc-400">
                    {result.meals.breakfast}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Utensils className="w-5 h-5 mt-0.5 text-orange-400" />
                <div>
                  <span className="font-medium text-zinc-200 block mb-1">
                    Lunch
                  </span>
                  <span className="text-zinc-400">{result.meals.lunch}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Moon className="w-5 h-5 mt-0.5 text-blue-400" />
                <div>
                  <span className="font-medium text-zinc-200 block mb-1">
                    Dinner
                  </span>
                  <span className="text-zinc-400">{result.meals.dinner}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Apple className="w-5 h-5 mt-0.5 text-zinc-400" />
                <div>
                  <span className="font-medium text-zinc-200 block mb-1">
                    Snacks
                  </span>
                  <span className="text-zinc-400">{result.meals.snacks}</span>
                </div>
              </li>
            </ul>
          </div>
        )}

        {/* Save Plan Button */}
        {result && (
          <button
            onClick={handleSavePlan}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-lg bg-zinc-800 text-zinc-50 font-semibold cursor-pointer border border-zinc-700 hover:border-emerald-400 hover:text-emerald-400 transition disabled:opacity-50"
          >
            {loading ? "Saving to Database..." : "Save Plan to Dashboard"}
          </button>
        )}
      </div>
    </div>
  );
}
