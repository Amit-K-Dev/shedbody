export const tdeeCalculator = {
  id: "6c8f4251-0bb9-4dce-b23f-c8f6f0ea14c8",
  slug: "tdee",
  name: "TDEE Calculator",
  category: "fitness",
  ctaLabel: "Calculate TDEE",
  historyMetric: "tdee",
  historyLabel: "TDEE",

  description:
    "Estimate total daily energy expenditure from body details, activity level, and a trusted metabolic equation.",

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
      min: 12,
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
      key: "formula",
      label: "Formula",
      type: "select",
      defaultValue: "mifflin",
      options: [
        { label: "Mifflin-St Jeor", value: "mifflin" },
        { label: "Revised Harris-Benedict", value: "harris" },
      ],
      required: true,
    },
  ],

  result: { type: "tdee", unit: "kcal/day", label: "Total Daily Energy Expenditure" },
};
