export const bmiCalculator = {
  id: "656eb7b6-54df-44fa-bba8-602d2b5b21eb",
  slug: "bmi",
  name: "BMI Calculator",
  category: "fitness",

  description:
    "Calculate your Body Mass Index (BMI) to understand your weight category based on height and weight.",

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
      min: 10,
      max: 500,
      required: true,
    },
  ],

  result: {
    type: "bmi",
    unit: "kg/m²",
    label: "Body Mass Index",
  },
};
