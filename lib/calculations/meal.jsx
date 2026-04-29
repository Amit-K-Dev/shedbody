export function calculateMeal(inputs) {
  const calories = Number(inputs.calories);
  const protein = Number(inputs.protein);
  const carbs = Number(inputs.carbs);
  const fats = Number(inputs.fats);
  const meals = Number(inputs.meals || 4);

  if (!calories || !protein || carbs < 0 || !fats || !meals) {
    throw new Error("Please enter daily calories, macros, and meals");
  }

  const perMealCalories = Math.round(calories / meals);
  const perMealProtein = Math.round(protein / meals);
  const perMealCarbs = Math.round(carbs / meals);
  const perMealFats = Math.round(fats / meals);

  return {
    meals,
    calories,
    perMealCalories,
    perMealProtein,
    perMealCarbs,
    perMealFats,
    mealBlocks: Array.from({ length: meals }, (_, index) => ({
      label: `Meal ${index + 1}`,
      calories: perMealCalories,
      protein: perMealProtein,
      carbs: perMealCarbs,
      fats: perMealFats,
    })),
  };
}
