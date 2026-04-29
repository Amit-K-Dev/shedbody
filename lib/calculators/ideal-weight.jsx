export const idealWeightCalculator = {
  id: "70f8af19-14d2-4a85-a76b-f0e84d4cb8b5",
  slug: "ideal-weight",
  name: "Ideal Weight Calculator",
  category: "fitness",
  ctaLabel: "Calculate Ideal Weight",
  historyMetric: "idealWeight",
  historyLabel: "Ideal Weight",

  description:
    "Estimate your ideal body weight range using height, gender, and trusted medical reference formulas.",

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
  ],

  result: {
    type: "ideal-weight",
    unit: "kg",
    label: "Ideal Weight",
  },
};
