const LB_TO_KG = 0.45359237;
const ML_PER_FL_OZ = 29.5735295625;

function round(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

export function calculateDailyHydration({
  weight,
  activityMinutes = 0,
  climate = "normal",
  unit = "metric",
}) {
  if (!weight) {
    throw new Error("Please enter your weight");
  }

  const weightValue = Number(weight);
  const activity = Math.max(0, Number(activityMinutes) || 0);

  if (weightValue <= 0) {
    throw new Error("Weight must be a positive number");
  }

  const weightKg = unit === "imperial" ? weightValue * LB_TO_KG : weightValue;
  const climateMl = {
    normal: 0,
    warm: 500,
    hot: 750,
  }[climate] ?? 0;

  const baseMl = weightKg * 35;
  const activityMl = (activity / 30) * 500;
  const totalMl = baseMl + activityMl + climateMl;
  const hydrationLiters = totalMl / 1000;

  return {
    hydrationLiters: round(hydrationLiters, 2),
    totalMl: Math.round(totalMl),
    totalOz: round(totalMl / ML_PER_FL_OZ),
    cups: Math.round(totalMl / 250),
    bottles: round(totalMl / 500),
    baseLiters: round(baseMl / 1000, 2),
    activityLiters: round(activityMl / 1000, 2),
    climateLiters: round(climateMl / 1000, 2),
    climateLabel:
      climate === "hot" ? "Hot or heavy sweating" : climate === "warm" ? "Warm or humid" : "Normal",
    note:
      "Hydration needs can change with sweat rate, medicines, pregnancy, kidney or heart conditions, and medical advice.",
  };
}
