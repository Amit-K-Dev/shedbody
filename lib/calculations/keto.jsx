const activityMap = {
  sedentary: { factor: 1.2, label: "Sedentary" },
  light: { factor: 1.375, label: "Light training" },
  moderate: { factor: 1.55, label: "Moderate training" },
  active: { factor: 1.725, label: "Hard training" },
};

const goalMap = {
  fat_loss: { label: "Fat loss", adjustment: -500 },
  maintenance: { label: "Maintenance", adjustment: 0 },
  muscle_gain: { label: "Muscle gain", adjustment: 250 },
};

export function calculateKeto(inputs) {
  const {
    unit = "metric",
    gender = "male",
    age = 0,
    height = 0,
    weight = 0,
    activity = "moderate",
    goal = "fat_loss",
    netCarbs = 25,
  } = inputs;

  const numericAge = Number(age);
  const inputHeight = Number(height);
  const inputWeight = Number(weight);
  const carbs = Number(netCarbs);

  if (!numericAge || !inputHeight || !inputWeight || !carbs) {
    throw new Error("Please enter age, height, weight, and net carbs");
  }

  const heightCm = unit === "imperial" ? inputHeight * 2.54 : inputHeight;
  const weightKg = unit === "imperial" ? inputWeight * 0.453592 : inputWeight;
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * numericAge + (gender === "female" ? -161 : 5);
  const activityProfile = activityMap[activity] || activityMap.moderate;
  const goalProfile = goalMap[goal] || goalMap.fat_loss;
  const maintenanceCalories = Math.round(bmr * activityProfile.factor);
  const targetCalories = Math.max(1200, maintenanceCalories + goalProfile.adjustment);
  const protein = Math.round(weightKg * (goal === "muscle_gain" ? 2 : 1.8));
  const carbCalories = carbs * 4;
  const proteinCalories = protein * 4;
  const fats = Math.max(35, Math.round((targetCalories - carbCalories - proteinCalories) / 9));
  const fatCalories = fats * 9;

  return {
    targetCalories,
    calories: targetCalories,
    maintenanceCalories,
    goalLabel: goalProfile.label,
    activityLabel: activityProfile.label,
    netCarbs: carbs,
    protein,
    fats,
    macros: { protein, carbs, fats },
    macroCalories: { protein: proteinCalories, carbs: carbCalories, fats: fatCalories },
    ketoRatio: Math.round((fatCalories / targetCalories) * 100),
    note: "Use this as a planning estimate. Keto targets can vary with training load, medical history, and adherence.",
  };
}
