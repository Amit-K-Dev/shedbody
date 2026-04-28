import { dietPlans } from "@/data/diet";

const activityMap = {
  sedentary: { factor: 1.2, label: "Sedentary" },
  light: { factor: 1.375, label: "Light training" },
  moderate: { factor: 1.55, label: "Moderate training" },
  active: { factor: 1.725, label: "Hard training" },
  very_active: { factor: 1.9, label: "Athlete level" },
};

const goalMap = {
  fat_loss: {
    label: "Fat loss",
    adjustment: -500,
    proteinPerKg: 2.2,
    fatRatio: 0.25,
    pace: "Steady deficit for visible fat loss while keeping protein high.",
  },
  maintenance: {
    label: "Maintenance",
    adjustment: 0,
    proteinPerKg: 1.8,
    fatRatio: 0.27,
    pace: "Stable intake for recomposition, performance, and habit building.",
  },
  muscle_gain: {
    label: "Muscle gain",
    adjustment: 300,
    proteinPerKg: 2,
    fatRatio: 0.25,
    pace: "Controlled surplus to support training recovery and lean mass gain.",
  },
};

const goalOrder = ["fat_loss", "maintenance", "muscle_gain"];

function getNearestPlan(goal, targetCalories, dietType) {
  const goalPlans = dietPlans[goal] || dietPlans.maintenance;
  const calories = Object.keys(goalPlans).map(Number);

  if (!calories.length) return null;

  const nearestCalories = calories.reduce((nearest, current) =>
    Math.abs(current - targetCalories) < Math.abs(nearest - targetCalories)
      ? current
      : nearest,
  );

  const plan = goalPlans[nearestCalories]?.[dietType] || goalPlans[nearestCalories]?.veg;

  if (!plan) return null;

  return {
    goal,
    goalLabel: goalMap[goal]?.label || "Diet plan",
    dietType,
    calories: nearestCalories,
    macros: plan.macros,
    meals: plan.meals?.slice(0, 4) || [],
    totalMeals: plan.meals?.length || 0,
  };
}

function getGoalCalories(maintenanceCalories, goal) {
  const goalProfile = goalMap[goal] || goalMap.fat_loss;
  return Math.max(1200, Math.round(maintenanceCalories + goalProfile.adjustment));
}

function getMacroTargets(weight, targetCalories, goal) {
  const goalProfile = goalMap[goal] || goalMap.fat_loss;
  const protein = Math.round(weight * goalProfile.proteinPerKg);
  const fats = Math.round((targetCalories * goalProfile.fatRatio) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - protein * 4 - fats * 9) / 4));

  return {
    macros: {
      protein,
      carbs,
      fats,
    },
    macroCalories: {
      protein: protein * 4,
      carbs: carbs * 4,
      fats: fats * 9,
    },
  };
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function getPlanFitNote(goal, bmiCategory) {
  if (goal === "fat_loss") {
    if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
      return "Strong fit based on BMI and current energy needs.";
    }
    return "Useful for a short cut, but avoid aggressive dieting if performance drops.";
  }

  if (goal === "maintenance") {
    if (bmiCategory === "Normal") {
      return "Balanced baseline for recomposition and habit consistency.";
    }
    return "Good reset option before pushing deficit or surplus phases.";
  }

  if (bmiCategory === "Underweight" || bmiCategory === "Normal") {
    return "Good fit for lean gaining with controlled calories.";
  }

  return "Use when strength gain is priority, but monitor waist and weekly weight.";
}

export function calculateCalories(inputs) {
  const {
    unit = "metric",
    gender = "male",
    age = 0,
    height = 0,
    weight = 0,
    activity = "moderate",
    goal = "fat_loss",
    dietType = "veg",
  } = inputs;

  const numericAge = Number(age);
  const inputHeight = Number(height);
  const inputWeight = Number(weight);

  if (!numericAge || !inputHeight || !inputWeight) {
    throw new Error("Please enter age, height, and weight");
  }

  if (numericAge <= 0 || inputHeight <= 0 || inputWeight <= 0) {
    throw new Error("Age, height, and weight must be positive numbers");
  }

  const numericHeight = unit === "imperial" ? inputHeight * 2.54 : inputHeight;
  const numericWeight = unit === "imperial" ? inputWeight * 0.453592 : inputWeight;

  const activityProfile = activityMap[activity] || activityMap.moderate;
  const goalProfile = goalMap[goal] || goalMap.fat_loss;
  const genderOffset = gender === "female" ? -161 : 5;
  const bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + genderOffset;
  const maintenanceCalories = Math.round(bmr * activityProfile.factor);
  const targetCalories = getGoalCalories(maintenanceCalories, goal);
  const { macros, macroCalories } = getMacroTargets(
    numericWeight,
    targetCalories,
    goal,
  );
  const plan = getNearestPlan(goal, targetCalories, dietType);
  const heightInMeters = numericHeight / 100;
  const bmi = Number((numericWeight / (heightInMeters * heightInMeters)).toFixed(1));
  const bmiCategory = getBmiCategory(bmi);
  const planOptions = goalOrder
    .map((optionGoal) => {
      const optionCalories = getGoalCalories(maintenanceCalories, optionGoal);
      const optionMacros = getMacroTargets(numericWeight, optionCalories, optionGoal);
      const optionPlan = getNearestPlan(optionGoal, optionCalories, dietType);

      if (!optionPlan) return null;

      return {
        ...optionPlan,
        targetCalories: optionCalories,
        isSelected: optionGoal === goal,
        pace: goalMap[optionGoal].pace,
        fitNote: getPlanFitNote(optionGoal, bmiCategory),
        calculatedMacros: optionMacros.macros,
        calculatedMacroCalories: optionMacros.macroCalories,
      };
    })
    .filter(Boolean);

  return {
    bmr: Math.round(bmr),
    maintenanceCalories,
    targetCalories,
    calories: targetCalories,
    bmi,
    bmiCategory,
    unit,
    category: goalProfile.label,
    activityLabel: activityProfile.label,
    goalLabel: goalProfile.label,
    dietLabel: dietType === "nonVeg" ? "Non-vegetarian" : "Vegetarian",
    pace: goalProfile.pace,
    macros,
    macroCalories,
    plan,
    planOptions,
  };
}
