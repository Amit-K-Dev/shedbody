function getBmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obesity class I";
  if (bmi < 40) return "Obesity class II";
  return "Obesity class III";
}

export function calculateGastricSleeveWeightLoss(inputs) {
  const unit = inputs.unit || "metric";
  const height = Number(inputs.height);
  const surgeryWeight = Number(inputs.surgeryWeight);
  const currentWeight = Number(inputs.currentWeight);
  const monthsSinceSurgery = Number(inputs.monthsSinceSurgery);
  const expectedEwl = Number(inputs.expectedEwl || 60);

  if (!height || !surgeryWeight || !currentWeight || monthsSinceSurgery < 0) {
    throw new Error("Please enter height, surgery weight, current weight, and months since surgery");
  }

  const heightM = unit === "imperial" ? height * 0.0254 : height / 100;
  const surgeryWeightKg =
    unit === "imperial" ? surgeryWeight * 0.453592 : surgeryWeight;
  const currentWeightKg =
    unit === "imperial" ? currentWeight * 0.453592 : currentWeight;
  const healthyWeightKg = 24.9 * heightM * heightM;
  const excessWeightKg = Math.max(0, surgeryWeightKg - healthyWeightKg);
  const estimatedLossKg = excessWeightKg * (expectedEwl / 100);
  const projectedWeightKg = Math.max(healthyWeightKg, surgeryWeightKg - estimatedLossKg);
  const actualLossKg = Math.max(0, surgeryWeightKg - currentWeightKg);
  const progressPercent =
    estimatedLossKg > 0 ? Math.min(100, Math.round((actualLossKg / estimatedLossKg) * 100)) : 0;
  const currentBmi = currentWeightKg / (heightM * heightM);
  const projectedBmi = projectedWeightKg / (heightM * heightM);
  const unitLabel = unit === "imperial" ? "lb" : "kg";
  const multiplier = unit === "imperial" ? 2.20462 : 1;
  const projectedTotalLoss = estimatedLossKg * multiplier;
  const actualLoss = actualLossKg * multiplier;
  const remainingLoss = Math.max(0, (estimatedLossKg - actualLossKg) * multiplier);
  const projectedWeight = projectedWeightKg * multiplier;

  return {
    estimatedLoss: Number(projectedTotalLoss.toFixed(1)),
    actualLoss: Number(actualLoss.toFixed(1)),
    remainingLoss: Number(remainingLoss.toFixed(1)),
    projectedWeight: Number(projectedWeight.toFixed(1)),
    progressPercent,
    expectedEwl,
    monthsSinceSurgery,
    unitLabel,
    currentBmi: Number(currentBmi.toFixed(1)),
    projectedBmi: Number(projectedBmi.toFixed(1)),
    currentBmiCategory: getBmiCategory(currentBmi),
    projectedBmiCategory: getBmiCategory(projectedBmi),
    milestones: [
      {
        label: "3 months",
        loss: Number((projectedTotalLoss * 0.3).toFixed(1)),
      },
      {
        label: "6 months",
        loss: Number((projectedTotalLoss * 0.55).toFixed(1)),
      },
      {
        label: "12 months",
        loss: Number((projectedTotalLoss * 0.85).toFixed(1)),
      },
      {
        label: "18 months",
        loss: Number(projectedTotalLoss.toFixed(1)),
      },
    ],
    note:
      "This estimate is for education only. Gastric sleeve outcomes vary with surgical follow-up, nutrition, protein intake, complications, medications, activity, and medical history.",
  };
}
