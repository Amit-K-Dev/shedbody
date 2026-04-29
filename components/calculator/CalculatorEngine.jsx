"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculatorMap } from "@/lib/calculations";
import {
  Activity,
  Apple,
  BarChart3,
  Baby,
  Calendar,
  CalendarClock,
  Droplets,
  Dumbbell,
  Flame,
  Leaf,
  Ruler,
  Scale,
  Target,
  Utensils,
  UserRound,
  Weight,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const bmiDetails = {
  Underweight: {
    color: "text-sky-300 bg-sky-500/10 border-sky-500/25",
    msg: "You may need a structured weight-gain plan.",
  },
  Normal: {
    color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    msg: "You are in a healthy range.",
  },
  Overweight: {
    color: "text-amber-300 bg-amber-500/10 border-amber-500/25",
    msg: "A small calorie deficit and movement plan can help.",
  },
  Obese: {
    color: "text-rose-300 bg-rose-500/10 border-rose-500/25",
    msg: "Health risk can be higher. Consider a guided plan.",
  },
};

const mealIconMap = {
  meal1: Apple,
  meal2: Apple,
  meal3: Utensils,
  meal4: Flame,
  postWorkout: Activity,
  meal5: Utensils,
  meal6: Apple,
  tips: Target,
};

const inputIconMap = {
  method: CalendarClock,
  unit: Scale,
  gender: UserRound,
  age: Calendar,
  height: Ruler,
  weight: Weight,
  currentWeight: Weight,
  targetWeight: Target,
  weeklyChange: CalendarClock,
  calories: Flame,
  protein: Dumbbell,
  carbs: Apple,
  fats: Utensils,
  servings: Utensils,
  activityMinutes: Dumbbell,
  duration: CalendarClock,
  activity: Dumbbell,
  activityType: Dumbbell,
  goal: Target,
  dietType: Leaf,
  style: BarChart3,
  lifeStage: UserRound,
  netCarbs: Leaf,
  climate: Droplets,
  waist: Ruler,
  hip: Ruler,
  lmpDate: Calendar,
  conceptionDate: Baby,
  cycleLength: CalendarClock,
};

function buildInitialInputs(inputs) {
  return inputs.reduce((acc, input) => {
    if (input.defaultValue !== undefined) acc[input.key] = input.defaultValue;
    return acc;
  }, {});
}

function parseInputs(config, inputs) {
  return config.inputs.reduce((acc, input) => {
    const value = inputs[input.key] ?? input.defaultValue ?? "";
    acc[input.key] =
      input.type === "select" ||
      input.type === "segmented" ||
      input.type === "date"
        ? value
        : parseFloat(value) || 0;
    return acc;
  }, {});
}

function getVisibleInputs(config, inputs) {
  return config.inputs.filter((input) => {
    if (!input.showWhen) return true;
    const currentValue =
      inputs[input.showWhen.key] ??
      config.inputs.find((item) => item.key === input.showWhen.key)
        ?.defaultValue;
    return currentValue === input.showWhen.value;
  });
}

function getInputPresentation(input, inputs) {
  const unit = inputs.unit || "metric";
  const dynamicKey = inputs.measurementType;
  const unitLabel =
    input.dynamicUnitLabels?.[dynamicKey]?.[unit] || input.unitLabels?.[unit];
  const label = unitLabel ? `${input.label} (${unitLabel})` : input.label;
  const placeholder =
    input.dynamicPlaceholders?.[dynamicKey]?.[unit] ||
    input.placeholders?.[unit] ||
    input.placeholder ||
    `Enter ${input.label.toLowerCase()}`;

  return { label, placeholder };
}

function CalculatorBadgeIcon() {
  return <BarChart3 size={14} />;
}

function BMIResult({ result }) {
  const details = bmiDetails[result.category] || bmiDetails.Obese;

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
        <Activity size={24} />
      </div>
      <p className="text-5xl font-black tracking-tight text-white">
        {result.bmi}
      </p>
      <div
        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${details.color}`}
      >
        {result.category}
      </div>
      <p className="mt-4 text-sm text-zinc-400">{details.msg}</p>

      <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] font-bold">
        <span className="rounded-xl border border-sky-500/10 bg-sky-500/5 p-2 text-sky-400">
          UNDER &lt; 18.5
        </span>
        <span className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-2 text-emerald-400">
          NORMAL 18.5-24.9
        </span>
        <span className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-2 text-amber-400">
          OVER 25-29.9
        </span>
        <span className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-2 text-rose-400">
          OBESE 30+
        </span>
      </div>
    </div>
  );
}

function CalorieResult({ result }) {
  const plans = result.planOptions?.length
    ? result.planOptions
    : result.plan
      ? [result.plan]
      : [];
  const macroTotal =
    result.macroCalories.protein +
    result.macroCalories.carbs +
    result.macroCalories.fats;

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Daily target
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">
              {result.targetCalories}
            </p>
            <p className="mt-1 text-sm text-zinc-500">kcal per day</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <Flame size={24} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3 backdrop-blur">
            <p className="text-zinc-500">BMR</p>
            <p className="mt-1 font-bold text-zinc-100">{result.bmr} kcal</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3 backdrop-blur">
            <p className="text-zinc-500">Maintenance</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.maintenanceCalories} kcal
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3 backdrop-blur">
            <p className="text-zinc-500">BMI</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.bmi} {result.bmiCategory}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3 backdrop-blur">
            <p className="text-zinc-500">Activity</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.activityLabel}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-sm leading-6 text-zinc-300">
          {result.pace}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-emerald-300" size={18} />
          <h3 className="font-bold text-white">Macro Breakdown</h3>
        </div>

        <div className="space-y-3">
          {[
            [
              "Protein",
              result.macros.protein,
              result.macroCalories.protein,
              "bg-emerald-400",
            ],
            [
              "Carbs",
              result.macros.carbs,
              result.macroCalories.carbs,
              "bg-sky-400",
            ],
            [
              "Fats",
              result.macros.fats,
              result.macroCalories.fats,
              "bg-amber-400",
            ],
          ].map(([label, grams, calories, color]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-zinc-200">{label}</span>
                <span className="text-zinc-500">{grams}g</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full ${color}`}
                  style={{
                    width: `${Math.max(8, (calories / macroTotal) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {plans.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Recommended diet plans
              </p>
              <h3 className="mt-1 font-bold text-white">
                Compare fat loss, maintenance, and muscle gain
              </h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Based on your BMR, TDEE, BMI, goal, and {result.dietLabel}{" "}
                preference.
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              {result.goalLabel} selected
            </div>
          </div>

          <div className="grid gap-3">
            {plans.map((plan) => {
              const featuredMeals = plan.meals?.slice(0, 3) || [];

              return (
                <div
                  key={plan.goal}
                  className={`rounded-2xl border p-4 transition ${
                    plan.isSelected
                      ? "border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-950/20"
                      : "border-white/10 bg-white/3"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-zinc-100">
                          {plan.goalLabel}
                        </p>
                        {plan.isSelected && (
                          <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                            Best match
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {plan.fitNote}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">
                        {plan.calories}
                      </p>
                      <p className="text-xs text-zinc-500">kcal plan</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-2">
                      <p className="font-bold text-emerald-300">
                        {plan.macros.protein}g
                      </p>
                      <p className="mt-0.5 text-zinc-500">Protein</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-2">
                      <p className="font-bold text-sky-300">
                        {plan.macros.carbs}g
                      </p>
                      <p className="mt-0.5 text-zinc-500">Carbs</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-950/70 p-2">
                      <p className="font-bold text-amber-300">
                        {plan.macros.fats}g
                      </p>
                      <p className="mt-0.5 text-zinc-500">Fats</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {featuredMeals.map((meal) => {
                      const Icon = mealIconMap[meal.id] || Utensils;

                      return (
                        <div
                          key={meal.id}
                          className="rounded-xl border border-white/10 bg-zinc-950/70 p-3"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Icon size={15} className="text-emerald-300" />
                            <p className="text-sm font-semibold text-zinc-100">
                              {meal.name}
                            </p>
                            {meal.time && (
                              <span className="ml-auto text-[11px] text-zinc-500">
                                {meal.time}
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-5 text-zinc-400">
                            {meal.items}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {plan.totalMeals > featuredMeals.length && (
                    <p className="mt-3 text-xs font-medium text-zinc-500">
                      Showing {featuredMeals.length} of {plan.totalMeals} plan
                      blocks.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function IdealWeightResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Estimated ideal weight
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">
              {result.idealWeight}
              <span className="ml-2 text-2xl text-zinc-500">{result.unit}</span>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Suggested range: {result.rangeLow}-{result.rangeHigh}{" "}
              {result.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <Scale size={26} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-200">
              Healthy BMI range
            </span>
            <span className="text-zinc-500">BMI 18.5-24.9</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-sky-500/10 bg-sky-500/5 p-3">
              <p className="text-zinc-500">Lower end</p>
              <p className="mt-1 font-bold text-sky-300">
                {result.healthyBmiLow} {result.unit}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-3">
              <p className="text-zinc-500">Upper end</p>
              <p className="mt-1 font-bold text-emerald-300">
                {result.healthyBmiHigh} {result.unit}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-emerald-300" size={18} />
          <h3 className="font-bold text-white">Formula Comparison</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Object.entries(result.formulas).map(([name, value]) => (
            <div
              key={name}
              className="rounded-2xl border border-white/10 bg-white/3 p-3"
            >
              <p className="text-zinc-500">{name}</p>
              <p className="mt-1 font-bold text-zinc-100">
                {value} {result.unit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DailyHydrationResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-sky-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-sky-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">
              Daily water target
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">
              {result.hydrationLiters}
              <span className="ml-2 text-2xl text-zinc-500">L</span>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {result.totalMl} ml or about {result.totalOz} fl oz
            </p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-sky-300 shadow-lg shadow-sky-950/20">
            <Droplets size={26} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Cups</p>
            <p className="mt-1 font-bold text-zinc-100">{result.cups} cups</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">500 ml bottles</p>
            <p className="mt-1 font-bold text-zinc-100">{result.bottles}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Exercise add-on</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.activityLiters} L
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Climate</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.climateLabel}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>
    </div>
  );
}

function WeightGoalResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              {result.direction} timeline
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">
              {result.weeksToGoal}
              <span className="ml-2 text-2xl text-zinc-500">weeks</span>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Estimated date: {result.targetDateLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <Target size={26} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Total change</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.totalChange} {result.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Weekly pace</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.weeklyChange} {result.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Current</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.currentWeight} {result.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Target</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.targetWeight} {result.unit}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-sm leading-6 text-zinc-300">
          {result.paceNote}
        </p>
        <p className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>
    </div>
  );
}

function HipToWaistRatioResult({ result }) {
  const details =
    result.category === "Low risk"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
      : result.category === "Moderate risk"
        ? "text-amber-300 bg-amber-500/10 border-amber-500/25"
        : "text-rose-300 bg-rose-500/10 border-rose-500/25";

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Hip-to-waist ratio
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">
              {result.hwr}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              WHR companion value: {result.whr}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <Ruler size={26} />
          </div>
        </div>

        <div
          className={`mt-6 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${details}`}
        >
          {result.category}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Waist</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.waist} {result.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Hip</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.hip} {result.unit}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-sm leading-6 text-zinc-300">
          {result.guidance}
        </p>
      </div>
    </div>
  );
}

function PregnancyResult({ result }) {
  const progressWidth = `${result.progressPercent}%`;

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Estimated due date
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              {result.dueDateLabel}
            </p>
            <p className="mt-2 text-sm text-zinc-500">{result.datingBasis}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <Baby size={26} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-200">
              Week {result.gestationalWeeks}, day{" "}
              {result.gestationalRemainderDays}
            </span>
            <span className="text-zinc-500">{result.progressPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Trimester</p>
            <p className="mt-1 font-bold text-zinc-100">{result.trimester}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Days to due date</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.daysUntilDue >= 0 ? result.daysUntilDue : "Past due"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Estimated conception</p>
            <p className="mt-1 font-bold text-zinc-100">
              {result.conceptionDateLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
            <p className="text-zinc-500">Status</p>
            <p className="mt-1 font-bold text-zinc-100">{result.status}</p>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="text-emerald-300" size={18} />
          <h3 className="font-bold text-white">Pregnancy Timeline</h3>
        </div>
        <div className="space-y-3">
          {result.milestones.map((milestone) => (
            <div
              key={milestone.label}
              className="rounded-2xl border border-white/10 bg-white/3 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-zinc-100">{milestone.label}</p>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-bold text-emerald-300">
                  {milestone.dateLabel}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {milestone.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BabyPercentileResult({ result }) {
  const markerLeft = `${Math.min(98, Math.max(2, result.percentile))}%`;

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              Estimated percentile
            </p>
            <p className="mt-2 text-5xl font-black tracking-tight text-white">
              {result.percentile}
              <span className="text-2xl text-zinc-500">th</span>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              {result.measurementLabel} for a {result.ageMonths}-month{" "}
              {result.sexLabel.toLowerCase()}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <Baby size={26} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-200">
              {result.category}
            </span>
            <span className="text-zinc-500">
              {result.inputValue} {result.inputUnit}
            </span>
          </div>
          <div className="relative h-2.5 rounded-full bg-linear-to-r from-sky-400 via-emerald-400 to-amber-400">
            <span
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-white shadow-lg"
              style={{ left: markerLeft }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-500">
            <span>2nd</span>
            <span>50th</span>
            <span>98th</span>
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-sm leading-6 text-zinc-300">
          {result.guidance}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-emerald-300" size={18} />
          <h3 className="font-bold text-white">Reference Bands</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
          {[
            ["2nd", result.referenceRange.p2],
            ["15th", result.referenceRange.p15],
            ["50th", result.referenceRange.p50],
            ["85th", result.referenceRange.p85],
            ["98th", result.referenceRange.p98],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/3 p-3"
            >
              <p className="text-zinc-500">{label}</p>
              <p className="mt-1 font-bold text-zinc-100">
                {value} {result.metricUnit}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>
    </div>
  );
}

function MacroSummaryResult({ result, subtitle }) {
  const total =
    result.macroCalories?.protein +
    result.macroCalories?.carbs +
    result.macroCalories?.fats;

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
              {subtitle ||
                result.goalLabel ||
                result.styleLabel ||
                "Daily target"}
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight text-white">
              {result.targetCalories || result.calories}
              <span className="ml-2 text-xl text-zinc-500">kcal</span>
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300 shadow-lg shadow-emerald-950/20">
            <BarChart3 size={26} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            [
              "Protein",
              result.macros.protein,
              result.macroCalories.protein,
              "bg-emerald-400",
            ],
            [
              "Carbs",
              result.macros.carbs,
              result.macroCalories.carbs,
              "bg-sky-400",
            ],
            [
              "Fats",
              result.macros.fats,
              result.macroCalories.fats,
              "bg-amber-400",
            ],
          ].map(([label, grams, calories, color]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/3 p-4"
            >
              <p className="text-sm font-semibold text-zinc-100">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">{grams}g</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full ${color}`}
                  style={{ width: `${Math.max(6, (calories / total) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {result.note && (
          <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            {result.note}
          </p>
        )}
      </div>
    </div>
  );
}

function MicronutrientResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
          {result.genderLabel} / {result.lifeStageLabel}
        </p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
          Daily micronutrient targets
        </h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {result.targets.map((target) => (
            <div
              key={target.label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/3 p-4"
            >
              <span className="text-sm font-semibold text-zinc-200">
                {target.label}
              </span>
              <span className="text-right font-black text-emerald-300">
                {target.value} {target.unit}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>
    </div>
  );
}

function MealResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
          {result.meals} meals per day
        </p>
        <p className="mt-2 text-4xl font-black tracking-tight text-white">
          {result.perMealCalories}
          <span className="ml-2 text-xl text-zinc-500">kcal / meal</span>
        </p>
        <div className="mt-6 grid gap-3">
          {result.mealBlocks.map((meal) => (
            <div
              key={meal.label}
              className="rounded-2xl border border-white/10 bg-white/3 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-zinc-100">{meal.label}</p>
                <p className="text-sm font-black text-emerald-300">
                  {meal.calories} kcal
                </p>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                {meal.protein}g protein / {meal.carbs}g carbs / {meal.fats}g
                fats
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecipeResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
          Per serving
        </p>
        <p className="mt-2 text-5xl font-black tracking-tight text-white">
          {result.caloriesPerServing}
          <span className="ml-2 text-2xl text-zinc-500">kcal</span>
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="font-black text-emerald-300">
              {result.proteinPerServing}g
            </p>
            <p className="mt-1 text-zinc-500">Protein</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="font-black text-sky-300">{result.carbsPerServing}g</p>
            <p className="mt-1 text-zinc-500">Carbs</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="font-black text-amber-300">
              {result.fatsPerServing}g
            </p>
            <p className="mt-1 text-zinc-500">Fats</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaloriesBurnedByActivityResult({ result }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-3xl border border-emerald-400/20 bg-zinc-950/70 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
          {result.activityLabel} / {result.duration} minutes
        </p>
        <p className="mt-2 text-5xl font-black tracking-tight text-white">
          {result.caloriesBurned}
          <span className="ml-2 text-2xl text-zinc-500">kcal</span>
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="text-zinc-500">Per minute</p>
            <p className="mt-1 font-black text-zinc-100">
              {result.perMinute} kcal
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
            <p className="text-zinc-500">MET value</p>
            <p className="mt-1 font-black text-zinc-100">{result.met}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {result.note}
        </p>
      </div>
    </div>
  );
}

function ResultPanel({ config, result }) {
  if (config.result?.type === "keto") {
    return <MacroSummaryResult result={result} title="Keto Targets" />;
  }
  if (config.result?.type === "macro") {
    return <MacroSummaryResult result={result} title="Macro Targets" />;
  }
  if (config.result?.type === "micronutrient") {
    return <MicronutrientResult result={result} />;
  }
  if (config.result?.type === "meal") {
    return <MealResult result={result} />;
  }
  if (config.result?.type === "recipe") {
    return <RecipeResult result={result} />;
  }
  if (config.result?.type === "calories-burned-by-activity") {
    return <CaloriesBurnedByActivityResult result={result} />;
  }
  if (config.result?.type === "baby-percentile") {
    return <BabyPercentileResult result={result} />;
  }
  if (config.result?.type === "daily-hydration") {
    return <DailyHydrationResult result={result} />;
  }
  if (config.result?.type === "hip-to-waist-ratio") {
    return <HipToWaistRatioResult result={result} />;
  }
  if (config.result?.type === "ideal-weight") {
    return <IdealWeightResult result={result} />;
  }
  if (config.result?.type === "pregnancy") {
    return <PregnancyResult result={result} />;
  }
  if (config.result?.type === "weight-goal") {
    return <WeightGoalResult result={result} />;
  }
  if (config.result?.type === "calories")
    return <CalorieResult result={result} />;
  return <BMIResult result={result} />;
}

export default function CalculatorEngine({ config }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [inputs, setInputs] = useState(() => buildInitialInputs(config.inputs));
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const metricKey = config.historyMetric || config.result?.type || "bmi";
  const metricLabel = config.historyLabel || config.result?.label || "Result";

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("calculator_results")
      .select("id, result_data, input_data, is_latest, created_at")
      .eq("calculator_id", config.id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(7);

    setHistory(data || []);
  }, [config.id, supabase, user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const saveResult = async (resultData, inputData) => {
    const now = new Date().toISOString();

    await supabase
      .from("calculator_results")
      .update({ is_latest: false, update_at: now })
      .eq("user_id", user.id)
      .eq("calculator_id", config.id)
      .eq("is_latest", true)
      .is("deleted_at", null);

    const { error } = await supabase.from("calculator_results").insert([
      {
        user_id: user.id,
        calculator_id: config.id,
        input_data: inputData,
        result_data: resultData,
        is_latest: true,
        update_at: now,
      },
    ]);

    if (!error) fetchHistory();
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError("");
      const parsedInputs = parseInputs(config, inputs);
      const output = calculatorMap[config.slug](parsedInputs);
      setResult(output);

      if (user) {
        await saveResult(output, parsedInputs);
      }
    } catch (err) {
      setError(err.message || "Calculation failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...history].reverse().map((item) => ({
    date: new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: item.result_data?.[metricKey],
  }));

  const trend =
    history.length > 1
      ? Number(
          (
            history[0].result_data?.[metricKey] -
            history[1].result_data?.[metricKey]
          ).toFixed(1),
        )
      : 0;
  const visibleInputs = getVisibleInputs(config, inputs);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/65 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/60 to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              <CalculatorBadgeIcon />
              ShedBody calculator
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
              {config.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {config.description}
            </p>
          </div>

          <div className="grid gap-4">
            {visibleInputs.map((input) => {
              const Icon = inputIconMap[input.key] || Target;
              const presentation = getInputPresentation(input, inputs);

              return (
                <div key={input.key}>
                  <label className="mb-2 ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                    <Icon size={14} className="text-emerald-300" />
                    {presentation.label}
                  </label>

                  {input.type === "segmented" ? (
                    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-zinc-950/70 p-1.5 shadow-inner shadow-black/20">
                      {input.options.map((option) => {
                        const active =
                          (inputs[input.key] ?? input.defaultValue) ===
                          option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleChange(input.key, option.value)
                            }
                            className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                              active
                                ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                                : "text-zinc-400 hover:bg-white/4 hover:text-zinc-100"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : input.type === "select" ? (
                    <select
                      value={inputs[input.key] ?? input.defaultValue ?? ""}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-white shadow-inner shadow-black/20 transition hover:border-emerald-400/30 focus:border-emerald-400 focus:outline-none"
                      onChange={(event) =>
                        handleChange(input.key, event.target.value)
                      }
                    >
                      {input.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : input.type === "date" ? (
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-white shadow-inner shadow-black/20 transition placeholder:text-zinc-700 hover:border-emerald-400/30 focus:border-emerald-400 focus:outline-none"
                      value={inputs[input.key] ?? ""}
                      onChange={(event) =>
                        handleChange(input.key, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      type="number"
                      inputMode="decimal"
                      min={input.min}
                      max={input.max}
                      placeholder={presentation.placeholder}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-white shadow-inner shadow-black/20 transition placeholder:text-zinc-700 hover:border-emerald-400/30 focus:border-emerald-400 focus:outline-none"
                      value={inputs[input.key] ?? ""}
                      onChange={(event) =>
                        handleChange(input.key, event.target.value)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 font-black text-black shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:translate-y-0 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            <Target size={18} />
            {loading ? "Analyzing..." : config.ctaLabel || "Calculate"}
          </button>
        </div>

        <div className="min-h-105">
          {result ? (
            <ResultPanel config={config} result={result} />
          ) : (
            <div className="relative flex h-full min-h-105 flex-col justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/65 p-8 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Target size={30} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Precision plan preview
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                Enter your details to see the result panel, saved progress for
                logged-in users, and personalized nutrition guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      {user && history.length > 1 && (
        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                Saved progress
              </p>
              <h3 className="mt-1 text-lg font-bold text-white">
                {metricLabel} trend
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                trend <= 0
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-amber-400/10 text-amber-300"
              }`}
            >
              {trend <= 0 ? "Down" : "Up"} {Math.abs(trend)}
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis dataKey="date" hide />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                  formatter={(value) => [value, metricLabel]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
