import { calculateBMI } from "./bmi";
import { calculateBabyPercentile } from "./baby-percentile";
import { calculateCalories } from "./calorie";
import { calculatePregnancy } from "./pregnancy";

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
  pregnancy: calculatePregnancy,
  "baby-percentile": calculateBabyPercentile,
};
