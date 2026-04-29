import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { recipeCalculator } from "@/lib/calculators/recipe";

const title = "Recipe Calculator";
const description =
  "Use the ShedBody Recipe Calculator to convert total recipe calories, protein, carbs, and fats into accurate per-serving nutrition.";
const path = "/calculators/recipe";
const features = [
  "Calories per serving",
  "Protein per serving",
  "Carbs and fats per serving",
  "Meal prep nutrition breakdown",
];

export const metadata = {
  title: "Recipe Calculator - Nutrition Per Serving | ShedBody",
  description,
  keywords: ["recipe calculator", "nutrition per serving", "recipe calorie calculator", "meal prep calculator"],
  alternates: { canonical: path },
  openGraph: { title: "Recipe Calculator - ShedBody", description, url: path, siteName: "ShedBody", type: "website" },
  twitter: { card: "summary", title: "Recipe Calculator - ShedBody", description },
};

export default function RecipeCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={recipeCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">How the Recipe Calculator Works</h2>
      <p>
        Enter the full recipe totals and serving count. ShedBody divides the
        totals by servings so each portion is easier to log.
      </p>
    </CalculatorSeoPage>
  );
}
