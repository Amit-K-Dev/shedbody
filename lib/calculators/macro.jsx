export const macroCalculator = {
  id: "58ec8e4b-7a9f-45e4-a048-4f1fd7b28622",
  slug: "macro",
  name: "Macro Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Macros",
  historyMetric: "calories",
  historyLabel: "Macro Calories",

  description:
    "Split your daily calories into protein, carbs, and fats for fat loss, maintenance, muscle gain, keto, or balanced eating.",

  inputs: [
    { key: "calories", label: "Daily Calories", type: "number", placeholder: "e.g. 2200", min: 800, max: 6000, required: true },
    {
      key: "style",
      label: "Macro Style",
      type: "select",
      defaultValue: "balanced",
      options: [
        { label: "Balanced", value: "balanced" },
        { label: "High protein", value: "high_protein" },
        { label: "Low carb", value: "low_carb" },
        { label: "Keto", value: "keto" },
      ],
      required: true,
    },
    {
      key: "goal",
      label: "Goal",
      type: "select",
      defaultValue: "maintenance",
      options: [
        { label: "Fat loss", value: "fat_loss" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Muscle gain", value: "muscle_gain" },
      ],
      required: true,
    },
  ],

  result: { type: "macro", unit: "grams/day", label: "Macro Targets" },
};
