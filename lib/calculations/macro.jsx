const styleRatios = {
  balanced: { label: "Balanced", protein: 0.3, carbs: 0.4, fats: 0.3 },
  high_protein: { label: "High protein", protein: 0.35, carbs: 0.35, fats: 0.3 },
  low_carb: { label: "Low carb", protein: 0.35, carbs: 0.25, fats: 0.4 },
  keto: { label: "Keto", protein: 0.25, carbs: 0.05, fats: 0.7 },
};

const goalNotes = {
  fat_loss: "Prioritize protein and consistency while keeping the deficit sustainable.",
  maintenance: "Use this split as a stable baseline for performance and habit tracking.",
  muscle_gain: "Pair the macro target with progressive training and steady weekly progress.",
};

export function calculateMacros(inputs) {
  const calories = Number(inputs.calories);
  const profile = styleRatios[inputs.style] || styleRatios.balanced;

  if (!calories || calories <= 0) {
    throw new Error("Please enter daily calories");
  }

  const protein = Math.round((calories * profile.protein) / 4);
  const carbs = Math.round((calories * profile.carbs) / 4);
  const fats = Math.round((calories * profile.fats) / 9);

  return {
    calories,
    styleLabel: profile.label,
    goalLabel:
      inputs.goal === "fat_loss"
        ? "Fat loss"
        : inputs.goal === "muscle_gain"
          ? "Muscle gain"
          : "Maintenance",
    macros: { protein, carbs, fats },
    macroCalories: {
      protein: protein * 4,
      carbs: carbs * 4,
      fats: fats * 9,
    },
    note: goalNotes[inputs.goal] || goalNotes.maintenance,
  };
}
