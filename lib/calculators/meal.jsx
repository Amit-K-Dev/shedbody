export const mealCalculator = {
  id: "c7c2597f-aa64-4048-9d23-03e357fbaef2",
  slug: "meal",
  name: "Meal Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Meals",
  historyMetric: "perMealCalories",
  historyLabel: "Calories Per Meal",

  description:
    "Divide daily calories and macros into meals and snacks for practical day-to-day meal planning.",

  inputs: [
    { key: "calories", label: "Daily Calories", type: "number", placeholder: "e.g. 2200", min: 800, max: 6000, required: true },
    { key: "protein", label: "Daily Protein", type: "number", placeholder: "e.g. 150", min: 20, max: 400, required: true },
    { key: "carbs", label: "Daily Carbs", type: "number", placeholder: "e.g. 220", min: 0, max: 800, required: true },
    { key: "fats", label: "Daily Fats", type: "number", placeholder: "e.g. 70", min: 10, max: 300, required: true },
    {
      key: "meals",
      label: "Meals Per Day",
      type: "select",
      defaultValue: "4",
      options: [
        { label: "3 meals", value: "3" },
        { label: "4 meals", value: "4" },
        { label: "5 meals", value: "5" },
        { label: "6 meals", value: "6" },
      ],
      required: true,
    },
  ],

  result: { type: "meal", unit: "per meal", label: "Meal Split" },
};
