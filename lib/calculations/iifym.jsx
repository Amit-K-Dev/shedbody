const activityMap = {
  sedentary: { factor: 1.2, label: "Sedentary" },
  light: { factor: 1.375, label: "Light training" },
  moderate: { factor: 1.55, label: "Moderate training" },
  active: { factor: 1.725, label: "Hard training" },
  very_active: { factor: 1.9, label: "Athlete level" },
};

const goalMap = {
  fat_loss: { label: "Fat loss", adjustment: -450 },
  maintenance: { label: "Maintenance", adjustment: 0 },
  muscle_gain: { label: "Muscle gain", adjustment: 300 },
};

const styleMap = {
  balanced: { label: "Balanced", proteinPerKg: 1.8, fatRatio: 0.28 },
  high_protein: { label: "High protein", proteinPerKg: 2.2, fatRatio: 0.25 },
  higher_carb: { label: "Higher carb", proteinPerKg: 1.7, fatRatio: 0.22 },
  lower_carb: { label: "Lower carb", proteinPerKg: 1.9, fatRatio: 0.35 },
};

export function calculateIifym(inputs) {
  const {
    unit = "metric",
    gender = "male",
    age = 0,
    height = 0,
    weight = 0,
    activity = "moderate",
    goal = "maintenance",
    style = "balanced",
  } = inputs;

  const numericAge = Number(age);
  const inputHeight = Number(height);
  const inputWeight = Number(weight);

  if (!numericAge || !inputHeight || !inputWeight) {
    throw new Error("Please enter age, height, and weight");
  }

  const heightCm = unit === "imperial" ? inputHeight * 2.54 : inputHeight;
  const weightKg = unit === "imperial" ? inputWeight * 0.453592 : inputWeight;
  const activityProfile = activityMap[activity] || activityMap.moderate;
  const goalProfile = goalMap[goal] || goalMap.maintenance;
  const styleProfile = styleMap[style] || styleMap.balanced;
  const bmr =
    10 * weightKg +
    6.25 * heightCm -
    5 * numericAge +
    (gender === "female" ? -161 : 5);
  const maintenanceCalories = Math.round(bmr * activityProfile.factor);
  const targetCalories = Math.max(1200, maintenanceCalories + goalProfile.adjustment);
  const protein = Math.round(weightKg * styleProfile.proteinPerKg);
  const fats = Math.round((targetCalories * styleProfile.fatRatio) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - protein * 4 - fats * 9) / 4));

  return {
    bmr: Math.round(bmr),
    maintenanceCalories,
    targetCalories,
    calories: targetCalories,
    activityLabel: activityProfile.label,
    goalLabel: goalProfile.label,
    styleLabel: styleProfile.label,
    macros: { protein, carbs, fats },
    macroCalories: {
      protein: protein * 4,
      carbs: carbs * 4,
      fats: fats * 9,
    },
    note:
      "IIFYM works best when food quality, fiber, protein, and consistency stay in the plan. Use these macros as flexible targets, then adjust from real progress.",
  };
}
