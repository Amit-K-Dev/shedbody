import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { micronutrientCalculator } from "@/lib/calculators/micronutrient";

const title = "Micronutrient Calculator";
const description =
  "Use the ShedBody Micronutrient Calculator to estimate daily vitamin, mineral, fiber, sodium, potassium, calcium, iron, magnesium, and folate targets.";
const path = "/calculators/micronutrient";
const features = [
  "Vitamin and mineral targets",
  "Fiber and sodium reference targets",
  "Pregnancy and breastfeeding adjustments",
  "Age and gender based estimates",
];

export const metadata = {
  title: "Micronutrient Calculator - Vitamins & Minerals | ShedBody",
  description,
  keywords: ["micronutrient calculator", "vitamin calculator", "mineral calculator", "daily nutrient targets"],
  alternates: { canonical: path },
  openGraph: { title: "Micronutrient Calculator - ShedBody", description, url: path, siteName: "ShedBody", type: "website" },
  twitter: { card: "summary", title: "Micronutrient Calculator - ShedBody", description },
};

export default function MicronutrientCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={micronutrientCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">How the Micronutrient Calculator Works</h2>
      <p>
        The calculator uses broad daily intake references and adjusts several
        targets for age, gender, pregnancy, and breastfeeding status.
      </p>
    </CalculatorSeoPage>
  );
}
