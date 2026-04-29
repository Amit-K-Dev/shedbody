import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { mealCalculator } from "@/lib/calculators/meal";

const title = "Meal Calculator";
const description =
  "Meal calculator planning from ShedBody helps turn daily calories and macros into meals you can actually follow. Split protein, carbs, fats, and calories across your day.";
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
  keywords: [
    "meal calculator",
    "meal planning calculator",
    "macros per meal calculator",
    "calories per meal",
    "protein per meal",
    "meal prep calculator",
    "daily macro split",
  ],
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
