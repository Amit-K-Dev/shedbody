import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { mealCalculator } from "@/lib/calculators/meal";

const title = "Meal Calculator";
const description =
  "Use the ShedBody Meal Calculator to divide daily calories, protein, carbs, and fats into practical per-meal targets for meal prep and tracking.";
const path = "/calculators/meal";
const features = [
  "Calories per meal",
  "Protein per meal",
  "Carbs and fats per meal",
  "3 to 6 meal split options",
];

export const metadata = {
  title: "Meal Calculator - Calories & Macros Per Meal | ShedBody",
  description,
  keywords: ["meal calculator", "calories per meal", "macros per meal", "meal prep calculator"],
  alternates: { canonical: path },
  openGraph: { title: "Meal Calculator - ShedBody", description, url: path, siteName: "ShedBody", type: "website" },
  twitter: { card: "summary", title: "Meal Calculator - ShedBody", description },
};

export default function MealCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={mealCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">How the Meal Calculator Works</h2>
      <p>
        Add your daily calories and macros, then choose how many meals you want.
        The calculator divides those targets into repeatable meal blocks.
      </p>
    </CalculatorSeoPage>
  );
}
