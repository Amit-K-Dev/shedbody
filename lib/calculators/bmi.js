export const bmiCalculator = {
  id: "656eb7b6-54df-44fa-bba8-602d2b5b21eb",
  slug: "bmi",
  name: "BMI Calculator",
  category: "fitness",

  description:
    "Calculate your Body Mass Index (BMI) to understand your weight category based on height and weight.",

  inputs: [
    {
      key: "height",
      label: "Height (cm)",
      type: "number",
      placeholder: "e.g. 175",
      min: 50,
      max: 300,
      required: true,
    },
    {
      key: "weight",
      label: "Weight (kg)",
      type: "number",
      placeholder: "e.g. 70",
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
