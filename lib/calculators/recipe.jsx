export const recipeCalculator = {
  id: "58f3d8ff-888f-458e-9b57-13f7c6d64cc8",
  slug: "recipe",
  name: "Recipe Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Recipe",
  historyMetric: "caloriesPerServing",
  historyLabel: "Calories Per Serving",

  description:
    "Convert total recipe calories and macros into per-serving nutrition for meal prep and tracking.",

  inputs: [
    { key: "servings", label: "Servings", type: "number", placeholder: "e.g. 4", min: 1, max: 100, required: true },
    { key: "calories", label: "Total Calories", type: "number", placeholder: "e.g. 1800", min: 1, max: 30000, required: true },
    { key: "protein", label: "Total Protein", type: "number", placeholder: "e.g. 120", min: 0, max: 2000, required: true },
    { key: "carbs", label: "Total Carbs", type: "number", placeholder: "e.g. 180", min: 0, max: 3000, required: true },
    { key: "fats", label: "Total Fats", type: "number", placeholder: "e.g. 70", min: 0, max: 2000, required: true },
  ],

  result: { type: "recipe", unit: "per serving", label: "Recipe Nutrition" },
};
