import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { macroCalculator } from "@/lib/calculators/macro";

const title = "Macro Calculator";
const description =
  "Use the ShedBody Macro Calculator to split daily calories into protein, carbohydrates, and fats for balanced, high-protein, low-carb, or keto eating.";
const path = "/calculators/macro";
const features = [
  "Protein target in grams",
  "Carb target in grams",
  "Fat target in grams",
  "Balanced, high-protein, low-carb, and keto styles",
];

export const metadata = {
  title: "Macro Calculator - Protein, Carbs & Fats | ShedBody",
  description,
  keywords: ["macro calculator", "macronutrient calculator", "protein carbs fats calculator"],
  alternates: { canonical: path },
  openGraph: { title: "Macro Calculator - ShedBody", description, url: path, siteName: "ShedBody", type: "website" },
  twitter: { card: "summary", title: "Macro Calculator - ShedBody", description },
};

export default function MacroCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={macroCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">How the Macro Calculator Works</h2>
      <p>
        Enter your calorie budget and choose a macro style. ShedBody converts
        calorie percentages into daily grams using protein and carbs at 4 kcal
        per gram and fat at 9 kcal per gram.
      </p>
    </CalculatorSeoPage>
  );
}
