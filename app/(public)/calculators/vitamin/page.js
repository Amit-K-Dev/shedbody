import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { vitaminCalculator } from "@/lib/calculators/vitamin";

const title = "Vitamin Calculator";
const description =
  "Vitamin calculator targets from ShedBody help you review daily vitamin needs with practical context. Estimate vitamins A, C, D, E, K, B vitamins, folate, and B12 from age, gender, diet, and life stage.";
const path = "/calculators/vitamin";
const features = [
  "Daily vitamin targets",
  "Vitamin D adjustment for low sun exposure",
  "B12 context for vegetarian and vegan diets",
  "Pregnancy and breastfeeding vitamin references",
];

export const metadata = {
  title: "Vitamin Calculator - Daily Vitamin Targets | ShedBody",
  description,
  keywords: [
    "vitamin calculator",
    "daily vitamin calculator",
    "vitamin intake calculator",
    "vitamin D calculator",
    "B12 calculator",
    "folate target",
    "vitamin requirements",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "Vitamin Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vitamin Calculator - ShedBody",
    description,
  },
};

export default function VitaminCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={vitaminCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the Vitamin Calculator Works
      </h2>
      <p>
        The calculator uses broad daily intake references and adjusts key
        targets for age, gender, pregnancy or breastfeeding status, diet pattern,
        and sun exposure.
      </p>
    </CalculatorSeoPage>
  );
}
