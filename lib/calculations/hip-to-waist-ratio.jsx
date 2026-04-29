function round(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function getWhrCategory(whr, gender) {
  if (gender === "female") {
    if (whr < 0.8) return "Low risk";
    if (whr < 0.85) return "Moderate risk";
    return "Higher risk";
  }

  if (whr < 0.9) return "Low risk";
  if (whr < 1) return "Moderate risk";
  return "Higher risk";
}

export function calculateHipToWaistRatio({ waist, hip, gender = "male", unit = "metric" }) {
  if (!waist || !hip) {
    throw new Error("Please enter both waist and hip measurements");
  }

  const waistValue = Number(waist);
  const hipValue = Number(hip);

  if (waistValue <= 0 || hipValue <= 0) {
    throw new Error("Waist and hip measurements must be positive numbers");
  }

  const hwr = hipValue / waistValue;
  const whr = waistValue / hipValue;
  const category = getWhrCategory(whr, gender);

  return {
    hwr: round(hwr),
    whr: round(whr),
    category,
    waist: round(waistValue, 1),
    hip: round(hipValue, 1),
    unit: unit === "imperial" ? "in" : "cm",
    genderLabel: gender === "female" ? "Female" : "Male",
    guidance:
      category === "Higher risk"
        ? "A higher waist-to-hip ratio can suggest more abdominal fat. Consider tracking waist changes alongside nutrition, training, and medical advice."
        : "This ratio is a useful body-shape marker, especially when paired with weight, BMI, and waist measurement trends.",
  };
}
