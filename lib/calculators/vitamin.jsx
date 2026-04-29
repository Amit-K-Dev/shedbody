export const vitaminCalculator = {
  id: "2fd0e336-7fef-4a0b-b124-7d8b2b78e0d6",
  slug: "vitamin",
  name: "Vitamin Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Vitamins",
  historyMetric: "vitaminD",
  historyLabel: "Vitamin D Target",

  description:
    "Estimate daily vitamin targets from age, gender, life stage, diet pattern, and sun exposure.",

  inputs: [
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
      min: 1,
      max: 100,
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
    {
      key: "dietPattern",
      label: "Diet Pattern",
      type: "select",
      defaultValue: "mixed",
      options: [
        { label: "Mixed diet", value: "mixed" },
        { label: "Vegetarian", value: "vegetarian" },
        { label: "Vegan", value: "vegan" },
      ],
      required: true,
    },
    {
      key: "sunExposure",
      label: "Sun Exposure",
      type: "select",
      defaultValue: "moderate",
      options: [
        { label: "Low", value: "low" },
        { label: "Moderate", value: "moderate" },
        { label: "High", value: "high" },
      ],
      required: true,
    },
  ],

  result: { type: "vitamin", unit: "daily targets", label: "Vitamins" },
};
