export const rmrCalculator = {
  id: "87858c45-ae6f-47f4-9af5-ec176f9dc1e6",
  slug: "rmr",
  name: "RMR Calculator",
  category: "fitness",
  ctaLabel: "Calculate RMR",
  historyMetric: "rmr",
  historyLabel: "RMR",

  description:
    "Estimate resting metabolic rate using age, gender, height, weight, and a trusted predictive equation.",

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

  result: { type: "rmr", unit: "kcal/day", label: "Resting Metabolic Rate" },
};
