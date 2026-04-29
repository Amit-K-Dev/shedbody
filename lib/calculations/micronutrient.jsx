function getAgeBand(age) {
  if (age <= 8) return "child";
  if (age <= 18) return "teen";
  if (age >= 51) return "older";
  return "adult";
}

export function calculateMicronutrients(inputs) {
  const age = Number(inputs.age);
  const gender = inputs.gender || "male";
  const lifeStage = inputs.lifeStage || "adult";

  if (!age || age <= 0) {
    throw new Error("Please enter age");
  }

  const band = getAgeBand(age);
  const female = gender === "female";
  const pregnant = female && lifeStage === "pregnant";
  const breastfeeding = female && lifeStage === "breastfeeding";
  const older = band === "older";

  const targets = [
    { label: "Fiber", value: female ? 25 : 38, unit: "g" },
    { label: "Calcium", value: older || band === "teen" ? 1300 : 1000, unit: "mg" },
    { label: "Iron", value: pregnant ? 27 : female && !older ? 18 : 8, unit: "mg" },
    { label: "Magnesium", value: female ? 320 : 420, unit: "mg" },
    { label: "Potassium", value: female ? 2600 : 3400, unit: "mg" },
    { label: "Vitamin D", value: older ? 20 : 15, unit: "mcg" },
    { label: "Vitamin B12", value: pregnant || breastfeeding ? 2.8 : 2.4, unit: "mcg" },
    { label: "Vitamin C", value: female ? 75 : 90, unit: "mg" },
    { label: "Folate", value: pregnant ? 600 : breastfeeding ? 500 : 400, unit: "mcg DFE" },
    { label: "Sodium upper limit", value: 2300, unit: "mg" },
  ];

  return {
    age,
    genderLabel: female ? "Female" : "Male",
    lifeStageLabel:
      lifeStage === "pregnant"
        ? "Pregnant"
        : lifeStage === "breastfeeding"
          ? "Breastfeeding"
          : "Adult",
    fiber: targets[0].value,
    targets,
    note: "Targets are general daily intake references. Medical conditions, lab values, and supplements can change your needs.",
  };
}
