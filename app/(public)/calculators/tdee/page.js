import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { tdeeCalculator } from "@/lib/calculators/tdee";

const title = "TDEE Calculator - Total Daily Energy Expenditure";
const description =
  "TDEE calculator estimates from ShedBody help you understand your maintenance calories with activity included. Calculate total daily energy expenditure, BMR, and practical calorie targets for fat loss, maintenance, or muscle gain.";
const path = "/calculators/tdee";
const features = [
  "Total daily energy expenditure estimate",
  "BMR with activity multiplier",
  "Fat loss and mild fat loss calorie targets",
  "Maintenance and muscle gain calorie targets",
];

export const metadata = {
  title: "TDEE Calculator - Total Daily Energy Expenditure | ShedBody",
  description,
  keywords: [
    "TDEE calculator",
    "total daily energy expenditure calculator",
    "maintenance calorie calculator",
    "BMR calculator",
    "activity multiplier",
    "fat loss calories",
    "muscle gain calories",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "TDEE Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TDEE Calculator - ShedBody",
    description,
  },
};

export default function TdeeCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={tdeeCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the TDEE Calculator Works
      </h2>
      <p>
        The calculator estimates your base metabolic rate, multiplies it by your
        selected activity level, then shows maintenance calories and common goal
        targets. Use it as a starting point and adjust based on real weekly
        progress.
      </p>
    </CalculatorSeoPage>
  );
}
