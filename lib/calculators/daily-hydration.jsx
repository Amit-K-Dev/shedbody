export const dailyHydrationCalculator = {
  id: "b8f2c6d4-2a9e-49d7-8d7d-3f35b4a3ef7a",
  slug: "daily-hydration",
  name: "Daily Hydration Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Hydration",
  historyMetric: "hydrationLiters",
  historyLabel: "Daily Hydration",

  description:
    "Estimate your daily water intake from body weight, exercise time, and climate conditions.",

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
      key: "activityMinutes",
      label: "Exercise Minutes",
      type: "number",
      placeholder: "e.g. 45",
      min: 0,
      max: 360,
      required: true,
    },
    {
      key: "climate",
      label: "Climate",
      type: "select",
      defaultValue: "normal",
      options: [
        { label: "Normal", value: "normal" },
        { label: "Warm or humid", value: "warm" },
        { label: "Hot or heavy sweating", value: "hot" },
      ],
      required: true,
    },
  ],

  result: {
    type: "daily-hydration",
    unit: "L/day",
    label: "Daily Hydration",
  },
};
