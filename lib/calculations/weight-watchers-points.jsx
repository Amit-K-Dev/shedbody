export function calculateWeightWatchersPoints(inputs) {
  const calories = Number(inputs.calories);
  const saturatedFat = Number(inputs.saturatedFat);
  const sugar = Number(inputs.sugar);
  const protein = Number(inputs.protein);
  const fiber = Number(inputs.fiber);
  const servings = Number(inputs.servings || 1);

  if (calories < 0 || saturatedFat < 0 || sugar < 0 || protein < 0 || fiber < 0) {
    throw new Error("Nutrition values cannot be negative");
  }

  if (!servings || servings <= 0) {
    throw new Error("Please enter a valid serving count");
  }

  const totalPoints = Math.max(
    0,
    Math.round(calories / 33 + saturatedFat * 0.9 + sugar / 9 - protein / 10 - fiber / 12),
  );
  const points = Number((totalPoints / servings).toFixed(1));
  const roundedPoints = Math.round(points);

  return {
    points,
    roundedPoints,
    totalPoints,
    servings,
    calories,
    saturatedFat,
    sugar,
    protein,
    fiber,
    perServingCalories: Math.round(calories / servings),
    note:
      "This is an educational estimate inspired by common points-style nutrition math. Official WeightWatchers points can vary by program, member settings, and zero-point food rules.",
  };
}
