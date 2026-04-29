import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { iifymCalculator } from "@/lib/calculators/iifym";

const title = "IIFYM Calculator - If It Fits Your Macros";
const description =
  "IIFYM calculator targets from ShedBody help you plan flexible dieting without losing structure. Estimate calories, protein, carbs, and fats for fat loss, maintenance, or muscle gain.";
const path = "/calculators/iifym";
const features = [
  "Flexible dieting calorie target",
  "Protein, carbs, and fat grams",
  "Fat loss, maintenance, and muscle gain goals",
  "Balanced, high-protein, higher-carb, and lower-carb macro styles",
];

export const metadata = {
  title: "IIFYM Calculator - If It Fits Your Macros | ShedBody",
  description,
  keywords: [
    "IIFYM calculator",
    "if it fits your macros calculator",
    "flexible dieting calculator",
    "macro calculator",
    "protein carbs fats",
    "calorie target",
    "macro tracking",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "IIFYM Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IIFYM Calculator - ShedBody",
    description,
  },
};

export default function IifymCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={iifymCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the IIFYM Calculator Works
      </h2>
      <p>
        The calculator estimates maintenance calories from body details and
        activity, applies your goal, then splits calories into flexible protein,
        carb, and fat targets based on your preferred macro style.
      </p>
    </CalculatorSeoPage>
  );
}
