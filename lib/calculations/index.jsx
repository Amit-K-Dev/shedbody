import { calculateBMI } from "./bmi";
import { calculateBabyPercentile } from "./baby-percentile";
import { calculateCalories } from "./calorie";
import { calculateDailyHydration } from "./daily-hydration";
import { calculateHipToWaistRatio } from "./hip-to-waist-ratio";
import { calculateIdealWeight } from "./ideal-weight";
import { calculatePregnancy } from "./pregnancy";
import { calculateWeightGoal } from "./weight-goal";

export const calculatorMap = {
  bmi: (inputs) => {
    const result = calculateBMI(inputs);
    const val = result.bmi;

    let category = "Obese";
    if (val < 18.5) category = "Underweight";
    else if (val < 25) category = "Normal";
    else if (val < 30) category = "Overweight";

    return { ...result, category };
  },

  calories: calculateCalories,
  "daily-hydration": calculateDailyHydration,
  "hip-to-waist-ratio": calculateHipToWaistRatio,
  "ideal-weight": calculateIdealWeight,
  pregnancy: calculatePregnancy,
  "weight-goal": calculateWeightGoal,
  "baby-percentile": calculateBabyPercentile,
};
