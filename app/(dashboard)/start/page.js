"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dietPlans } from "@/data/diet";
import { workoutPlans } from "@/data/workout";
import Link from "next/link";
import { saveUserProfile, savePlan } from "@/lib/storage";
import {
  Apple,
  CalendarDays,
  Egg,
  Moon,
  Utensils,
  Activity,
  Target,
  Flame,
  Dumbbell,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function StartPlan() {
  const router = useRouter();

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

  const activityMultiplier = { low: 1.2, moderate: 1.55, high: 1.75 };

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
      toast.error("Please fill all details to generate plan");
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

    let bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

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

      await savePlan(result);

      toast.show({
        title: "Active Protocol Initialized! 🔥",
        description: "Redirecting to your dashboard...",
        variant: "success",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to set active protocol. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-zinc-50 px-4 py-12 pb-32 overflow-hidden">
      {/* GLOBAL GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl mb-6 shadow-inner">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">
            Build Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-green-500">
              Smart Plan
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Let our AI generate a personalized workout & diet plan tailored to
            your body.
          </p>

          {/* QUICK LINKS */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/plans"
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition"
            >
              Saved Plans
            </Link>
          </div>
        </div>

        {/* INPUT FORM (Glassmorphism Card) */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" /> Primary Goal
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {["fat_loss", "muscle_gain", "maintenance"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    goal === g
                      ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400"
                      : "bg-zinc-950/50 text-zinc-400 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900"
                  }`}
                >
                  {g.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Experience Level
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {["beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    level === lvl
                      ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400"
                      : "bg-zinc-950/50 text-zinc-400 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900"
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Body Metrics
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3.5 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                  kg
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Height"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3.5 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                  cm
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 placeholder:text-zinc-600 rounded-xl px-4 py-3.5 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
                  yrs
                </span>
              </div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 rounded-xl px-4 py-3.5 outline-none transition-all appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full md:col-span-2 bg-zinc-950/50 border border-zinc-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-zinc-50 rounded-xl px-4 py-3.5 outline-none transition-all appearance-none"
              >
                <option value="low">Low Activity (Sedentary)</option>
                <option value="moderate">
                  Moderate Activity (Light Exercise)
                </option>
                <option value="high">High Activity (Active)</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Apple className="w-4 h-4" /> Dietary Preference
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDietType("veg")}
                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 ${dietType === "veg" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400" : "bg-zinc-950/50 text-zinc-400 border border-zinc-800 hover:border-emerald-500/50"}`}
              >
                Vegetarian
              </button>
              <button
                onClick={() => setDietType("nonVeg")}
                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 ${dietType === "nonVeg" ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400" : "bg-zinc-950/50 text-zinc-400 border border-zinc-800 hover:border-emerald-500/50"}`}
              >
                Non-Vegetarian
              </button>
            </div>
          </div>

          <button
            onClick={generatePlan}
            className="w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-green-500 text-black font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Generate My Plan
          </button>
        </div>

        {/* RESULTS SECTION (Elite Display) */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">
                    Daily Calories
                  </p>
                  <p className="text-2xl font-black text-zinc-50">
                    {result.calories}{" "}
                    <span className="text-sm font-normal text-zinc-500">
                      kcal
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">
                    Daily Protein
                  </p>
                  <p className="text-2xl font-black text-zinc-50">
                    {result.protein}{" "}
                    <span className="text-sm font-normal text-zinc-500">g</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Split Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Workout Panel */}
              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-zinc-50 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Workout
                  Protocol
                </h3>
                <ul className="space-y-3">
                  {result.workout?.map((day, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{day}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Meal Panel */}
              {result.meals && (
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-zinc-50 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-400" /> Nutrition
                    Plan
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                        <Egg className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Breakfast
                        </span>
                        <span className="text-sm text-zinc-300">
                          {result.meals.breakfast}
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                        <Utensils className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Lunch
                        </span>
                        <span className="text-sm text-zinc-300">
                          {result.meals.lunch}
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                        <Moon className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Dinner
                        </span>
                        <span className="text-sm text-zinc-300">
                          {result.meals.dinner}
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="p-2 bg-zinc-700/50 rounded-lg shrink-0">
                        <Apple className="w-4 h-4 text-zinc-300" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Snacks
                        </span>
                        <span className="text-sm text-zinc-300">
                          {result.meals.snacks}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSavePlan}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-zinc-100 text-black font-bold text-lg hover:bg-zinc-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save Plan & Go to Dashboard"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
