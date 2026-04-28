export const pregnancyCalculator = {
  id: "2b6ddcf1-0a45-4dd2-8f8d-84b8d985af24",
  slug: "pregnancy",
  name: "Pregnancy Calculator",
  category: "health",
  ctaLabel: "Calculate Due Date",
  historyMetric: "gestationalDays",
  historyLabel: "Pregnancy Progress",

  description:
    "Estimate your due date, current pregnancy week, trimester, and key milestones using LMP or conception date.",

  inputs: [
    {
      key: "method",
      label: "Calculation Method",
      type: "segmented",
      defaultValue: "lmp",
      options: [
        { label: "LMP", value: "lmp" },
        { label: "Conception", value: "conception" },
      ],
      required: true,
    },
    {
      key: "lmpDate",
      label: "First Day of Last Period",
      type: "date",
      showWhen: { key: "method", value: "lmp" },
      required: true,
    },
    {
      key: "cycleLength",
      label: "Average Cycle Length",
      type: "number",
      defaultValue: 28,
      placeholder: "e.g. 28",
      min: 20,
      max: 45,
      showWhen: { key: "method", value: "lmp" },
      required: true,
    },
    {
      key: "conceptionDate",
      label: "Conception Date",
      type: "date",
      showWhen: { key: "method", value: "conception" },
      required: true,
    },
  ],

  result: {
    type: "pregnancy",
    unit: "weeks",
    label: "Estimated Pregnancy Progress",
  },
};
