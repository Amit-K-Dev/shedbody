import { calculateBMI } from "./bmi";

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

  calories: (inputs) => {
    // Basic BMR calculation (Rough Draft)
    // Formula: 10 * weight + 6.25 * height - 5 * age + (gender_offset)
    const { weight = 0, height = 0, age = 0, gender = "male" } = inputs;

    if (!weight || !height || !age) return { calories: 0, status: "pending" };

    const genderOffset = gender === "male" ? 5 : -161;
    const bmr = 10 * weight + 6.25 * height - 5 * age + genderOffset;

    return {
      calories: Math.round(bmr),
      category: "Maintenance Calories (BMR)",
    };
  },
};
