export const weightGoalCalculator = {
  id: "4fe3c55d-5895-49a5-b3f4-0a1db036fb0c",
  slug: "weight-goal",
  name: "Weight Goal Calculator",
  category: "fitness",
  ctaLabel: "Calculate Goal Timeline",
  historyMetric: "weeksToGoal",
  historyLabel: "Weeks to Goal",

  description:
    "Estimate how long it may take to reach your target weight using a weekly progress pace.",

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
      key: "currentWeight",
      label: "Current Weight",
      type: "number",
      placeholder: "e.g. 78",
      unitLabels: {
        metric: "kg",
        imperial: "lb",
      },
      placeholders: {
        metric: "e.g. 78",
        imperial: "e.g. 172",
      },
      min: 20,
      max: 350,
      required: true,
    },
    {
      key: "targetWeight",
      label: "Target Weight",
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
      min: 20,
      max: 350,
      required: true,
    },
    {
      key: "weeklyChange",
      label: "Weekly Pace",
      type: "number",
      placeholder: "e.g. 0.5",
      unitLabels: {
        metric: "kg/week",
        imperial: "lb/week",
      },
      placeholders: {
        metric: "e.g. 0.5",
        imperial: "e.g. 1",
      },
      min: 0.1,
      max: 5,
      required: true,
    },
  ],

  result: {
    type: "weight-goal",
    unit: "weeks",
    label: "Goal Timeline",
  },
};
