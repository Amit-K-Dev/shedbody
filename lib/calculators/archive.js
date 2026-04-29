import { babyPercentileCalculator } from "@/lib/calculators/baby-percentile";
import { bmiCalculator } from "@/lib/calculators/bmi";
import { calorieCalculator } from "@/lib/calculators/calorie";
import { caloriesBurnedByActivityCalculator } from "@/lib/calculators/calories-burned-by-activity";
import { dailyHydrationCalculator } from "@/lib/calculators/daily-hydration";
import { hipToWaistRatioCalculator } from "@/lib/calculators/hip-to-waist-ratio";
import { idealWeightCalculator } from "@/lib/calculators/ideal-weight";
import { ketoCalculator } from "@/lib/calculators/keto";
import { macroCalculator } from "@/lib/calculators/macro";
import { mealCalculator } from "@/lib/calculators/meal";
import { micronutrientCalculator } from "@/lib/calculators/micronutrient";
import { pregnancyCalculator } from "@/lib/calculators/pregnancy";
import { recipeCalculator } from "@/lib/calculators/recipe";
import { weightGoalCalculator } from "@/lib/calculators/weight-goal";

function buildCalculatorItem({
  config,
  routeSlug = config.slug,
  title = config.name,
  description = config.description,
  icon = "Calculator",
  featured = false,
}) {
  return {
    id: config.id,
    routeSlug,
    href: `/calculators/${routeSlug}`,
    title,
    description: description || config.description,
    category: config.category,
    icon,
    featured,
  };
}

export const calculatorArchive = [
  buildCalculatorItem({
    config: bmiCalculator,
    title: "BMI Calculator",
    description:
      "Use ShedBody BMI Calculator to check your body mass index instantly. Get accurate BMI results, health category, and fitness insights.",
    icon: "Activity",
    featured: true,
  }),
  buildCalculatorItem({
    config: calorieCalculator,
    routeSlug: "calorie",
    title: "Calorie Calculator",
    description:
      "Calculate daily calories, BMR, TDEE, macros, and compare fat loss, maintenance, and muscle gain diet plans from ShedBody.",
    icon: "Flame",
    featured: true,
  }),
  buildCalculatorItem({
    config: idealWeightCalculator,
    title: "Ideal Weight Calculator",
    description:
      "Estimate your ideal body weight range using height, gender, and trusted medical reference formulas.",
    icon: "Scale",
    featured: true,
  }),
  buildCalculatorItem({
    config: dailyHydrationCalculator,
    title: "Daily Hydration Calculator",
    description:
      "Calculate daily water intake from body weight, exercise minutes, and climate. Estimate liters, cups, bottles, and fluid ounces.",
    icon: "Droplets",
    featured: true,
  }),
  buildCalculatorItem({
    config: ketoCalculator,
    title: "Keto Calculator",
    description:
      "Estimate keto calories, net carbs, protein, and fat targets from your body details and goal.",
    icon: "Flame",
    featured: true,
  }),
  buildCalculatorItem({
    config: macroCalculator,
    title: "Macro Calculator",
    description:
      "Split your daily calories into protein, carbs, and fats for fat loss, maintenance, muscle gain, keto, or balanced eating.",
    icon: "PieChart",
    featured: true,
  }),
  buildCalculatorItem({
    config: micronutrientCalculator,
    title: "Micronutrient Calculator",
    description:
      "Estimate daily vitamin, mineral, fiber, and hydration targets from age, gender, and life stage.",
    icon: "Pill",
  }),
  buildCalculatorItem({
    config: mealCalculator,
    title: "Meal Calculator",
    description:
      "Divide daily calories and macros into meals and snacks for practical day-to-day meal planning.",
    icon: "Utensils",
  }),
  buildCalculatorItem({
    config: recipeCalculator,
    title: "Recipe Calculator",
    description:
      "Convert total recipe calories and macros into per-serving nutrition for meal prep and tracking.",
    icon: "ChefHat",
  }),
  buildCalculatorItem({
    config: caloriesBurnedByActivityCalculator,
    title: "Calories Burned by Activity",
    description:
      "Estimate calories burned during walking, running, cycling, strength training, yoga, swimming, and more activities.",
    icon: "Bike",
  }),
  buildCalculatorItem({
    config: weightGoalCalculator,
    title: "Weight Goal Calculator",
    description:
      "Estimate how long it may take to reach your target weight using a weekly progress pace.",
    icon: "Target",
  }),
  buildCalculatorItem({
    config: hipToWaistRatioCalculator,
    title: "Hip-to-Waist Ratio Calculator",
    description:
      "Calculate hip-to-waist ratio and waist-to-hip ratio from waist and hip measurements.",
    icon: "Ruler",
  }),
  buildCalculatorItem({
    config: pregnancyCalculator,
    title: "Pregnancy Due Date Calculator",
    description:
      "Estimate your due date, current pregnancy week, trimester, and key milestones using LMP or conception date.",
    icon: "Baby",
  }),
  buildCalculatorItem({
    config: babyPercentileCalculator,
    title: "Baby Percentile Calculator",
    description:
      "Estimate baby weight, length, or head circumference percentile from birth to 24 months.",
    icon: "Baby",
  }),
];

export const featuredCalculators = calculatorArchive.filter(
  (calculator) => calculator.featured,
);
