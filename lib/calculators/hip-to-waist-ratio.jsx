export const hipToWaistRatioCalculator = {
  id: "ba7e06df-fb73-4d47-bd39-fcb3b2ab0ddf",
  slug: "hip-to-waist-ratio",
  name: "Hip-to-Waist Ratio Calculator",
  category: "fitness",
  ctaLabel: "Calculate Ratio",
  historyMetric: "hwr",
  historyLabel: "Hip-to-Waist Ratio",

  description:
    "Calculate hip-to-waist ratio and waist-to-hip ratio from waist and hip measurements.",

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
      key: "waist",
      label: "Waist",
      type: "number",
      placeholder: "e.g. 82",
      unitLabels: {
        metric: "cm",
        imperial: "in",
      },
      placeholders: {
        metric: "e.g. 82",
        imperial: "e.g. 32",
      },
      min: 20,
      max: 250,
      required: true,
    },
    {
      key: "hip",
      label: "Hip",
      type: "number",
      placeholder: "e.g. 98",
      unitLabels: {
        metric: "cm",
        imperial: "in",
      },
      placeholders: {
        metric: "e.g. 98",
        imperial: "e.g. 39",
      },
      min: 20,
      max: 250,
      required: true,
    },
  ],

  result: {
    type: "hip-to-waist-ratio",
    unit: "ratio",
    label: "Hip-to-Waist Ratio",
  },
};
