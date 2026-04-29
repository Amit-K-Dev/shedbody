function getAgeBand(age) {
  if (age <= 8) return "child";
  if (age <= 18) return "teen";
  if (age >= 51) return "older";
  return "adult";
}

export function calculateVitamins(inputs) {
  const age = Number(inputs.age);
  const gender = inputs.gender || "male";
  const lifeStage = inputs.lifeStage || "adult";
  const dietPattern = inputs.dietPattern || "mixed";
  const sunExposure = inputs.sunExposure || "moderate";

  if (!age || age <= 0) {
    throw new Error("Please enter age");
  }

  const band = getAgeBand(age);
  const female = gender === "female";
  const pregnant = female && lifeStage === "pregnant";
  const breastfeeding = female && lifeStage === "breastfeeding";
  const older = band === "older";
  const lowSun = sunExposure === "low";
  const vegan = dietPattern === "vegan";
  const vegetarian = dietPattern === "vegetarian";

  const targets = [
    { label: "Vitamin A", value: female ? 700 : 900, unit: "mcg RAE" },
    { label: "Vitamin C", value: breastfeeding ? 120 : pregnant ? 85 : female ? 75 : 90, unit: "mg" },
    { label: "Vitamin D", value: older || lowSun ? 20 : 15, unit: "mcg" },
    { label: "Vitamin E", value: breastfeeding ? 19 : 15, unit: "mg" },
    { label: "Vitamin K", value: female ? 90 : 120, unit: "mcg" },
    { label: "Thiamin (B1)", value: female ? 1.1 : 1.2, unit: "mg" },
    { label: "Riboflavin (B2)", value: female ? 1.1 : 1.3, unit: "mg" },
    { label: "Niacin (B3)", value: female ? 14 : 16, unit: "mg NE" },
    { label: "Vitamin B6", value: older ? 1.7 : female ? 1.3 : 1.3, unit: "mg" },
    { label: "Folate", value: pregnant ? 600 : breastfeeding ? 500 : 400, unit: "mcg DFE" },
    { label: "Vitamin B12", value: pregnant || breastfeeding || vegan || vegetarian ? 2.8 : 2.4, unit: "mcg" },
  ];

  return {
    age,
    vitaminD: targets.find((target) => target.label === "Vitamin D")?.value,
    genderLabel: female ? "Female" : "Male",
    lifeStageLabel:
      lifeStage === "pregnant"
        ? "Pregnant"
        : lifeStage === "breastfeeding"
          ? "Breastfeeding"
          : "Adult",
    targets,
    heading: "Daily vitamin targets",
    note:
      "Vitamin needs can change with lab results, medications, medical conditions, diet quality, and supplement use. Treat this as a planning reference, not a diagnosis.",
  };
}
