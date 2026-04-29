export const eerCalculator = {
  id: "c1dc1aa6-e6b0-4db1-b9db-14f67c0f3c1d",
  slug: "eer",
  name: "EER Calculator",
  category: "nutrition",
  ctaLabel: "Calculate EER",
  historyMetric: "eer",
  historyLabel: "EER",

  description:
    "Estimate daily energy requirement using age, gender, height, weight, activity level, and life stage.",

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
      placeholder: "e.g. 30",
      min: 3,
      max: 100,
      required: true,
    },
    {
      key: "height",
      label: "Height",
      type: "number",
      unitLabels: { metric: "cm", imperial: "in" },
      placeholders: { metric: "e.g. 175", imperial: "e.g. 69" },
      min: 50,
      max: 300,
      required: true,
    },
    {
      key: "weight",
      label: "Weight",
      type: "number",
      unitLabels: { metric: "kg", imperial: "lb" },
      placeholders: { metric: "e.g. 75", imperial: "e.g. 165" },
      min: 10,
      max: 350,
      required: true,
    },
    {
      key: "activity",
      label: "Activity Level",
      type: "select",
      defaultValue: "low_active",
      options: [
        { label: "Sedentary", value: "sedentary" },
        { label: "Low active", value: "low_active" },
        { label: "Active", value: "active" },
        { label: "Very active", value: "very_active" },
      ],
      required: true,
    },
    {
      key: "lifeStage",
      label: "Life Stage",
      type: "select",
      defaultValue: "adult",
      options: [
        { label: "Adult", value: "adult" },
        { label: "Pregnant", value: "pregnant" },
        { label: "Breastfeeding", value: "breastfeeding" },
      ],
      required: true,
    },
  ],

  result: { type: "eer", unit: "kcal/day", label: "Estimated Energy Requirement" },
};
