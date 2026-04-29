function round(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function addWeeksToToday(weeks) {
  const date = new Date();
  date.setDate(date.getDate() + Math.ceil(weeks * 7));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateWeightGoal({
  currentWeight,
  targetWeight,
  weeklyChange,
  unit = "metric",
}) {
  if (!currentWeight || !targetWeight || !weeklyChange) {
    throw new Error("Please enter current weight, target weight, and weekly pace");
  }

  const current = Number(currentWeight);
  const target = Number(targetWeight);
  const pace = Number(weeklyChange);

  if (current <= 0 || target <= 0 || pace <= 0) {
    throw new Error("Weights and weekly pace must be positive numbers");
  }

  const totalChange = Math.abs(target - current);
  const weeksToGoal = totalChange === 0 ? 0 : totalChange / pace;
  const direction = target < current ? "Fat loss" : target > current ? "Weight gain" : "Maintenance";
  const displayUnit = unit === "imperial" ? "lb" : "kg";
  const safePaceLimit = unit === "imperial" ? 2 : 1;
  const paceNote =
    pace > safePaceLimit
      ? "This is an aggressive pace. A slower plan may be easier to maintain."
      : "This is a moderate pace for many people, depending on health status and consistency.";

  return {
    weeksToGoal: round(weeksToGoal, 1),
    totalChange: round(totalChange, 1),
    currentWeight: round(current, 1),
    targetWeight: round(target, 1),
    weeklyChange: round(pace, 1),
    unit: displayUnit,
    direction,
    targetDateLabel: weeksToGoal === 0 ? "Already at goal" : addWeeksToToday(weeksToGoal),
    monthlyChange: round(pace * 4.345, 1),
    paceNote,
    note:
      "Scale weight is only one signal. Sleep, strength, measurements, energy, and medical guidance matter too.",
  };
}
