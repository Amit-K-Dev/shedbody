export const caloriesBurnedByActivityCalculator = {
  id: "c74fc75d-f1aa-4015-9788-8efef7ab322c",
  slug: "calories-burned-by-activity",
  name: "Calories Burned by Activity",
  category: "fitness",
  ctaLabel: "Calculate Burn",
  historyMetric: "caloriesBurned",
  historyLabel: "Calories Burned",

  description:
    "Estimate calories burned during walking, running, cycling, strength training, yoga, swimming, and more activities.",

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
      key: "weight",
      label: "Weight",
      type: "number",
      unitLabels: { metric: "kg", imperial: "lb" },
      placeholders: { metric: "e.g. 75", imperial: "e.g. 165" },
      min: 20,
      max: 350,
      required: true,
    },
    { key: "duration", label: "Duration", type: "number", placeholder: "e.g. 45", min: 1, max: 600, required: true },
    {
      key: "activityType",
      label: "Activity",
      type: "select",
      defaultValue: "walking",
      options: [
        { label: "Walking", value: "walking" },
        { label: "Running", value: "running" },
        { label: "Cycling", value: "cycling" },
        { label: "Strength training", value: "strength" },
        { label: "Yoga", value: "yoga" },
        { label: "Swimming", value: "swimming" },
        { label: "HIIT", value: "hiit" },
      ],
      required: true,
    },
  ],

  result: { type: "calories-burned-by-activity", unit: "kcal", label: "Calories Burned" },
};
