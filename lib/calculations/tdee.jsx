const activityMap = {
  sedentary: { factor: 1.2, label: "Sedentary" },
  light: { factor: 1.375, label: "Light training" },
  moderate: { factor: 1.55, label: "Moderate training" },
  active: { factor: 1.725, label: "Hard training" },
  very_active: { factor: 1.9, label: "Athlete level" },
};

function calculateMifflinStJeor({ gender, age, heightCm, weightKg }) {
  return (
    10 * weightKg +
    6.25 * heightCm -
    5 * age +
    (gender === "female" ? -161 : 5)
  );
}

function calculateRevisedHarrisBenedict({ gender, age, heightCm, weightKg }) {
  if (gender === "female") {
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }

  return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
}

export function calculateTdee(inputs) {
  const {
    unit = "metric",
    gender = "male",
    age = 0,
    height = 0,
    weight = 0,
    activity = "moderate",
    formula = "mifflin",
  } = inputs;

  const numericAge = Number(age);
  const inputHeight = Number(height);
  const inputWeight = Number(weight);

  if (!numericAge || !inputHeight || !inputWeight) {
    throw new Error("Please enter age, height, and weight");
  }

  const heightCm = unit === "imperial" ? inputHeight * 2.54 : inputHeight;
  const weightKg = unit === "imperial" ? inputWeight * 0.453592 : inputWeight;
  const formulaInputs = { gender, age: numericAge, heightCm, weightKg };
  const mifflin = Math.round(calculateMifflinStJeor(formulaInputs));
  const harris = Math.round(calculateRevisedHarrisBenedict(formulaInputs));
  const bmr = formula === "harris" ? harris : mifflin;
  const activityProfile = activityMap[activity] || activityMap.moderate;
  const tdee = Math.round(bmr * activityProfile.factor);

  return {
    tdee,
    calories: tdee,
    bmr,
    formulaLabel:
      formula === "harris" ? "Revised Harris-Benedict" : "Mifflin-St Jeor",
    activityLabel: activityProfile.label,
    activityFactor: activityProfile.factor,
    fatLossCalories: Math.max(1200, tdee - 500),
    mildFatLossCalories: Math.max(1200, tdee - 250),
    maintenanceCalories: tdee,
    muscleGainCalories: tdee + 250,
    note:
      "TDEE is an estimate of maintenance calories after activity. Track body weight, training, hunger, and energy for two to four weeks before making big changes.",
  };
}
