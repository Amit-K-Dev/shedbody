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

export function calculateRmr(inputs) {
  const {
    unit = "metric",
    gender = "male",
    age = 0,
    height = 0,
    weight = 0,
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
  const rmr = formula === "harris" ? harris : mifflin;

  return {
    rmr,
    calories: rmr,
    formulaLabel:
      formula === "harris" ? "Revised Harris-Benedict" : "Mifflin-St Jeor",
    mifflin,
    harris,
    lowActivityCalories: Math.round(rmr * 1.2),
    moderateActivityCalories: Math.round(rmr * 1.55),
    note:
      "RMR is an estimate of calories your body may use at rest. Lab testing, thyroid status, lean mass, medication, and dieting history can shift the real number.",
  };
}
