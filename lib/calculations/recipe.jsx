export function calculateRecipe(inputs) {
  const servings = Number(inputs.servings);
  const calories = Number(inputs.calories);
  const protein = Number(inputs.protein);
  const carbs = Number(inputs.carbs);
  const fats = Number(inputs.fats);

  if (!servings || servings <= 0 || !calories) {
    throw new Error("Please enter servings and total calories");
  }

  return {
    servings,
    caloriesPerServing: Math.round(calories / servings),
    proteinPerServing: Number((protein / servings).toFixed(1)),
    carbsPerServing: Number((carbs / servings).toFixed(1)),
    fatsPerServing: Number((fats / servings).toFixed(1)),
    totalCalories: calories,
    totalProtein: protein,
    totalCarbs: carbs,
    totalFats: fats,
  };
}
