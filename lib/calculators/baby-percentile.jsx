export const babyPercentileCalculator = {
  id: "af13db31-e72d-4b20-9da6-69dff5dbb82d",
  slug: "baby-percentile",
  name: "Baby Percentile Calculator",
  category: "health",
  ctaLabel: "Calculate Percentile",
  historyMetric: "percentile",
  historyLabel: "Percentile",

  description:
    "Estimate baby weight, length, or head circumference percentile from birth to 24 months.",

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
      key: "sex",
      label: "Baby Sex",
      type: "segmented",
      defaultValue: "boy",
      options: [
        { label: "Boy", value: "boy" },
        { label: "Girl", value: "girl" },
      ],
      required: true,
    },
    {
      key: "ageMonths",
      label: "Age",
      type: "number",
      placeholder: "e.g. 6",
      unitLabels: {
        metric: "months",
        imperial: "months",
      },
      min: 0,
      max: 24,
      required: true,
    },
    {
      key: "measurementType",
      label: "Measurement",
      type: "select",
      defaultValue: "weight",
      options: [
        { label: "Weight-for-age", value: "weight" },
        { label: "Length-for-age", value: "length" },
        { label: "Head circumference", value: "head" },
      ],
      required: true,
    },
    {
      key: "measurementValue",
      label: "Measurement Value",
      type: "number",
      placeholder: "e.g. 7.9",
      dynamicUnitLabels: {
        weight: {
          metric: "kg",
          imperial: "lb",
        },
        length: {
          metric: "cm",
          imperial: "in",
        },
        head: {
          metric: "cm",
          imperial: "in",
        },
      },
      dynamicPlaceholders: {
        weight: {
          metric: "e.g. 7.9",
          imperial: "e.g. 17.4",
        },
        length: {
          metric: "e.g. 67",
          imperial: "e.g. 26.4",
        },
        head: {
          metric: "e.g. 43",
          imperial: "e.g. 16.9",
        },
      },
      min: 0,
      max: 250,
      required: true,
    },
  ],

  result: {
    type: "baby-percentile",
    unit: "percentile",
    label: "Growth Percentile",
  },
};
