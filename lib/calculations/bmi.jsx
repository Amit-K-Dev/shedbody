export function calculateBMI({ height, weight, unit = "metric" }) {
  // Validate inputs
  if (!height || !weight) {
    throw new Error("Please enter both height and weight");
  }

  // Convert string inputs to numbers if they aren't already
  const h = Number(height);
  const w = Number(weight);

  if (h <= 0 || w <= 0) {
    throw new Error("Height and weight must be positive numbers");
  }

  let heightInMeters;
  let weightInKg;

  if (unit === "metric") {
    heightInMeters = h / 100;
    weightInKg = w;
  } else {
    // Imperial: height in inches, weight in lbs
    heightInMeters = h * 0.0254;
    weightInKg = w * 0.453592;
  }

  // Core formula: w / (h * h)
  const bmi = weightInKg / (heightInMeters * heightInMeters);

  return {
    bmi: Number(bmi.toFixed(1)),
  };
}

export function getBmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obesity class I";
  if (bmi < 40) return "Obesity class II";
  return "Obesity class III";
}
