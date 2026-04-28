export const calorieCalculator = {
  id: "9c1f48d8-1d95-4e3e-a4a8-7aa0e78ff6a5",
  slug: "calories",
  name: "Calorie Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Calories",
  historyMetric: "targetCalories",
  historyLabel: "Calories",

  description:
    "Estimate your daily calories, TDEE, macro targets, and matching ShedBody diet-plan options.",

  inputs: [
    {
      key: "unit",
      label: "Unit System",
      type: "segmented",
      defaultValue: "metric",
      options: [
        { label: "Metric", value: "metric" },
        { label: "Imperial", value: "imperial" },
      ],
      required: true,
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      defaultValue: "male",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
      required: true,
    },
    {
      key: "age",
      label: "Age",
      type: "number",
      placeholder: "e.g. 28",
      min: 12,
      max: 100,
      required: true,
    },
    {
      key: "height",
      label: "Height",
      type: "number",
      placeholder: "e.g. 175",
      unitLabels: {
        metric: "cm",
        imperial: "in",
      },
      placeholders: {
        metric: "e.g. 175",
        imperial: "e.g. 69",
      },
      min: 50,
      max: 300,
      required: true,
    },
    {
      key: "weight",
      label: "Weight",
      type: "number",
      placeholder: "e.g. 70",
      unitLabels: {
        metric: "kg",
        imperial: "lb",
      },
      placeholders: {
        metric: "e.g. 70",
        imperial: "e.g. 154",
      },
      min: 20,
      max: 350,
      required: true,
    },
    {
      key: "activity",
      label: "Activity Level",
      type: "select",
      defaultValue: "moderate",
      options: [
        { label: "Sedentary", value: "sedentary" },
        { label: "Light training", value: "light" },
        { label: "Moderate training", value: "moderate" },
        { label: "Hard training", value: "active" },
        { label: "Athlete level", value: "very_active" },
      ],
      required: true,
    },
    {
      key: "goal",
      label: "Goal",
      type: "select",
      defaultValue: "fat_loss",
      options: [
        { label: "Fat loss", value: "fat_loss" },
        { label: "Maintain", value: "maintenance" },
        { label: "Muscle gain", value: "muscle_gain" },
      ],
      required: true,
    },
    {
      key: "dietType",
      label: "Diet Preference",
      type: "select",
      defaultValue: "veg",
      options: [
        { label: "Vegetarian", value: "veg" },
        { label: "Non-vegetarian", value: "nonVeg" },
      ],
      required: true,
    },
  ],

  result: {
    type: "calories",
    unit: "kcal/day",
    label: "Daily Calorie Target",
  },
};
