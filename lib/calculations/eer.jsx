const adultActivity = {
  male: {
    sedentary: { factor: 1, label: "Sedentary" },
    low_active: { factor: 1.11, label: "Low active" },
    active: { factor: 1.25, label: "Active" },
    very_active: { factor: 1.48, label: "Very active" },
  },
  female: {
    sedentary: { factor: 1, label: "Sedentary" },
    low_active: { factor: 1.12, label: "Low active" },
    active: { factor: 1.27, label: "Active" },
    very_active: { factor: 1.45, label: "Very active" },
  },
};

const youthActivity = {
  male: {
    sedentary: { factor: 1, label: "Sedentary" },
    low_active: { factor: 1.13, label: "Low active" },
    active: { factor: 1.26, label: "Active" },
    very_active: { factor: 1.42, label: "Very active" },
  },
  female: {
    sedentary: { factor: 1, label: "Sedentary" },
    low_active: { factor: 1.16, label: "Low active" },
    active: { factor: 1.31, label: "Active" },
    very_active: { factor: 1.56, label: "Very active" },
  },
};

function getActivityProfile(gender, age, activity) {
  const map = age >= 19 ? adultActivity : youthActivity;
  return map[gender]?.[activity] || map[gender]?.low_active || map.male.low_active;
}

export function calculateEer(inputs) {
  const {
    unit = "metric",
    gender = "male",
    age = 0,
    height = 0,
    weight = 0,
    activity = "low_active",
    lifeStage = "adult",
  } = inputs;

  const numericAge = Number(age);
  const inputHeight = Number(height);
  const inputWeight = Number(weight);

  if (!numericAge || !inputHeight || !inputWeight) {
    throw new Error("Please enter age, height, and weight");
  }

  const heightM = unit === "imperial" ? inputHeight * 0.0254 : inputHeight / 100;
  const weightKg = unit === "imperial" ? inputWeight * 0.453592 : inputWeight;
  const activityProfile = getActivityProfile(gender, numericAge, activity);

  let baseEer;
  if (numericAge >= 19 && gender === "female") {
    baseEer =
      354 -
      6.91 * numericAge +
      activityProfile.factor * (9.36 * weightKg + 726 * heightM);
  } else if (numericAge >= 19) {
    baseEer =
      662 -
      9.53 * numericAge +
      activityProfile.factor * (15.91 * weightKg + 539.6 * heightM);
  } else if (gender === "female") {
    baseEer =
      135.3 -
      30.8 * numericAge +
      activityProfile.factor * (10 * weightKg + 934 * heightM) +
      25;
  } else {
    baseEer =
      88.5 -
      61.9 * numericAge +
      activityProfile.factor * (26.7 * weightKg + 903 * heightM) +
      25;
  }

  const lifeStageAdjustment =
    gender === "female" && lifeStage === "pregnant"
      ? 300
      : gender === "female" && lifeStage === "breastfeeding"
        ? 400
        : 0;
  const eer = Math.round(baseEer + lifeStageAdjustment);

  return {
    eer,
    calories: eer,
    baseEer: Math.round(baseEer),
    activityLabel: activityProfile.label,
    activityFactor: activityProfile.factor,
    lifeStageLabel:
      lifeStage === "pregnant"
        ? "Pregnant"
        : lifeStage === "breastfeeding"
          ? "Breastfeeding"
          : "Adult",
    lifeStageAdjustment,
    fatLossCalories: Math.max(1200, eer - 500),
    maintenanceCalories: eer,
    muscleGainCalories: eer + 250,
    note:
      "EER is a population-based estimate for daily energy needs. Real intake may need adjustment based on weight trends, training, appetite, medical status, and pregnancy or lactation guidance.",
  };
}
