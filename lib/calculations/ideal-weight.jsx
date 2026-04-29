const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

function round(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function toDisplayWeight(valueInKg, unit) {
  return round(unit === "imperial" ? valueInKg * KG_TO_LB : valueInKg);
}

export function calculateIdealWeight({ height, gender = "male", unit = "metric" }) {
  if (!height) {
    throw new Error("Please enter your height");
  }

  const h = Number(height);

  if (h <= 0) {
    throw new Error("Height must be a positive number");
  }

  const heightInInches = unit === "imperial" ? h : h * CM_TO_IN;

  if (heightInInches < 36 || heightInInches > 96) {
    throw new Error("Please enter a realistic adult height");
  }

  const inchesOverFiveFeet = Math.max(0, heightInInches - 60);
  const isMale = gender === "male";

  const formulasKg = {
    devine: (isMale ? 50 : 45.5) + (isMale ? 2.3 : 2.3) * inchesOverFiveFeet,
    robinson: (isMale ? 52 : 49) + (isMale ? 1.9 : 1.7) * inchesOverFiveFeet,
    miller: (isMale ? 56.2 : 53.1) + (isMale ? 1.41 : 1.36) * inchesOverFiveFeet,
    hamwi: (isMale ? 48 : 45.5) + (isMale ? 2.7 : 2.2) * inchesOverFiveFeet,
  };

  const valuesKg = Object.values(formulasKg);
  const averageKg = valuesKg.reduce((total, value) => total + value, 0) / valuesKg.length;
  const rangeLowKg = averageKg * 0.9;
  const rangeHighKg = averageKg * 1.1;
  const healthyBmiLowKg = 18.5 * (heightInInches * 0.0254) ** 2;
  const healthyBmiHighKg = 24.9 * (heightInInches * 0.0254) ** 2;
  const displayUnit = unit === "imperial" ? "lb" : "kg";

  return {
    idealWeight: toDisplayWeight(averageKg, unit),
    rangeLow: toDisplayWeight(rangeLowKg, unit),
    rangeHigh: toDisplayWeight(rangeHighKg, unit),
    healthyBmiLow: toDisplayWeight(healthyBmiLowKg, unit),
    healthyBmiHigh: toDisplayWeight(healthyBmiHighKg, unit),
    unit: displayUnit,
    formulas: {
      Devine: toDisplayWeight(formulasKg.devine, unit),
      Robinson: toDisplayWeight(formulasKg.robinson, unit),
      Miller: toDisplayWeight(formulasKg.miller, unit),
      Hamwi: toDisplayWeight(formulasKg.hamwi, unit),
    },
    note:
      "Ideal weight is an estimate. Body composition, muscle mass, age, and medical history can shift a healthy personal target.",
  };
}
