export const micronutrientCalculator = {
  id: "efe2f3ab-450e-4914-9b6c-4b117598ea4a",
  slug: "micronutrient",
  name: "Micronutrient Calculator",
  category: "nutrition",
  ctaLabel: "Calculate Micronutrients",
  historyMetric: "fiber",
  historyLabel: "Fiber Target",

  description:
    "Estimate daily vitamin, mineral, fiber, and hydration targets from age, gender, and life stage.",

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
    { key: "age", label: "Age", type: "number", placeholder: "e.g. 30", min: 1, max: 100, required: true },
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

  result: { type: "micronutrient", unit: "daily targets", label: "Micronutrients" },
};
