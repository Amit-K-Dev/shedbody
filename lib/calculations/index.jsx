import { calculateBMI } from "./bmi";
import { calculateBabyPercentile } from "./baby-percentile";
import { calculateCalories } from "./calorie";
import { calculateCaloriesBurnedByActivity } from "./calories-burned-by-activity";
import { calculateDailyHydration } from "./daily-hydration";
import { calculateEer } from "./eer";
import { calculateGastricSleeveWeightLoss } from "./gastric-sleeve-weight-loss";
import { calculateHipToWaistRatio } from "./hip-to-waist-ratio";
import { calculateIifym } from "./iifym";
import { calculateIdealWeight } from "./ideal-weight";
import { calculateKeto } from "./keto";
import { calculateMacros } from "./macro";
import { calculateMeal } from "./meal";
import { calculateMicronutrients } from "./micronutrient";
import { calculatePregnancy } from "./pregnancy";
import { calculateRecipe } from "./recipe";
import { calculateRmr } from "./rmr";
import { calculateTdee } from "./tdee";
import { calculateVitamins } from "./vitamin";
import { calculateWeightWatchersPoints } from "./weight-watchers-points";
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
  eer: calculateEer,
  "gastric-sleeve-weight-loss": calculateGastricSleeveWeightLoss,
  "hip-to-waist-ratio": calculateHipToWaistRatio,
  iifym: calculateIifym,
  "ideal-weight": calculateIdealWeight,
  pregnancy: calculatePregnancy,
  "weight-goal": calculateWeightGoal,
  "baby-percentile": calculateBabyPercentile,
  keto: calculateKeto,
  macro: calculateMacros,
  micronutrient: calculateMicronutrients,
  meal: calculateMeal,
  recipe: calculateRecipe,
  "calories-burned-by-activity": calculateCaloriesBurnedByActivity,
  rmr: calculateRmr,
  tdee: calculateTdee,
  vitamin: calculateVitamins,
  "weight-watchers-points": calculateWeightWatchersPoints,
};
