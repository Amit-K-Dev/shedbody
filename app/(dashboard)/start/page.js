"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dietPlans } from "@/data/diet";
import { workoutPlans } from "@/data/workout";
import Link from "next/link";
import { saveUserProfile, savePlan } from "@/lib/storage";
import {
  Sun,
  Apple,
  Utensils,
  Coffee,
  Dumbbell,
  Moon,
  Bed,
  Info,
  Activity,
  Target,
  Flame,
  Sparkles,
  User,
  Loader2,
  CalendarDays,
  Egg,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const iconMap = {
  sun: Sun,
  apple: Apple,
  utensils: Utensils,
  coffee: Coffee,
  dumbbell: Dumbbell,
  moon: Moon,
  bed: Bed,
  info: Info,
};

const colorMap = {
  yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  orange: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  red: "text-red-400 bg-red-400/10 border-red-400/20",
  blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  gray: "text-zinc-400 bg-zinc-800 border-zinc-700",
};

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

    // BMR & Maintenance Calculation
    let bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    let maintenance = bmr * activityMultiplier[activity];
    let calories;

    if (goal === "fat_loss") calories = maintenance - 400;
    else if (goal === "muscle_gain") calories = maintenance + 400;
    else calories = maintenance;

    const bmiCategory = getBMICategory(weight, height);
    const suggestedGoal = getSuggestedGoal(bmiCategory);
    const suggestedLevel = getSuggestedLevel(activity);

    // Finalize Goal
    const finalGoal = goal || suggestedGoal;
    const finalLevel = level || suggestedLevel;
    const adjustedCalories = adjustCalories(finalGoal, calories, []);

    // Fetch Workout (Safe Check)
    let workoutCategory = workoutPlans[finalGoal] ? finalGoal : "fat_loss";
    const workout = workoutPlans[workoutCategory]?.[finalLevel] || [];

    // Fetch Diet (Fallback Engine)
    let dietCategory =
      dietPlans[finalGoal] && Object.keys(dietPlans[finalGoal]).length > 0
        ? finalGoal
        : "fat_loss";
    const availableCalories = Object.keys(dietPlans[dietCategory] || {}).map(
      Number,
    );

    // Find the closest calorie available in the database
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
        dietPlans[dietCategory]?.[closest]?.[dietType] ||
        dietPlans[dietCategory]?.[closest]?.["veg"] ||
        Object.values(dietPlans[dietCategory][closest])[0];
    }

    const planProtein =
      diet?.macros?.protein ||
      Math.round(weight * (finalGoal === "muscle_gain" ? 2.2 : 2.0));

    const planCalories = closest || Math.round(adjustedCalories);

    // Final result setup
    setResult({
      goal: finalGoal,
      level: finalLevel,
      dietType,
      calories: planCalories,
      protein: planProtein,
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
            <div className="grid md:grid-cols-3 gap-3">
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
            <div className="grid md:grid-cols-3 gap-3">
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

              {/* NUTRITION PROTOCOL V2.0 */}
              {result && result.meals && (
                <div className="mt-6 p-6 md:p-8 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                  <h3 className="text-xl font-black text-zinc-50 mb-6 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-emerald-400" /> Premium
                    Nutrition Protocol
                  </h3>

                  {/* V2 MACROS (If Available) */}
                  {result.meals.macros && (
                    <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 mb-8">
                      <div className="text-center flex-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Protein
                        </p>
                        <p className="text-xl font-black text-blue-400">
                          {result.meals.macros.protein}g
                        </p>
                      </div>
                      <div className="w-px h-8 bg-zinc-800"></div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Carbs
                        </p>
                        <p className="text-xl font-black text-orange-400">
                          {result.meals.macros.carbs}g
                        </p>
                      </div>
                      <div className="w-px h-8 bg-zinc-800"></div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Fats
                        </p>
                        <p className="text-xl font-black text-yellow-400">
                          {result.meals.macros.fats}g
                        </p>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-4">
                    {/* 🧠 SMART RENDERING: Is it V2 (Array) or V1 (Object)? */}
                    {result.meals.meals && Array.isArray(result.meals.meals) ? (
                      // V2.0 Render Logic
                      result.meals.meals.map((meal) => {
                        const IconComponent = iconMap[meal.icon] || Info;
                        const colorStyle =
                          colorMap[meal.color] || colorMap.gray;

                        return (
                          <li
                            key={meal.id}
                            className="relative group overflow-hidden bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-liner-to-r from-transparent to-zinc-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex gap-4 relative z-10">
                              <div
                                className={`p-3 rounded-xl border shrink-0 flex items-center justify-center h-12 w-12 ${colorStyle}`}
                              >
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-zinc-200">
                                    {meal.name}
                                  </span>
                                  {meal.time && (
                                    <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md border border-zinc-700/50 uppercase tracking-wider">
                                      {meal.time}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                  {meal.items}
                                </p>
                                {meal.note && (
                                  <p className="text-xs text-red-400 mt-2 italic flex items-center gap-1">
                                    <Target className="w-3 h-3" /> {meal.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      // V1.0 Render Logic (Fallback for backward compatibility)
                      <>
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
                      </>
                    )}
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
