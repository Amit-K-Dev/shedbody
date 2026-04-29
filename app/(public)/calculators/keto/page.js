import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { ketoCalculator } from "@/lib/calculators/keto";

const title = "Keto Calculator";
const description =
  "Keto calculator targets from ShedBody help you plan low-carb eating with clearer numbers. Estimate daily calories, net carbs, protein, and fat for your goal.";
const path = "/calculators/keto";
const features = [
  "Keto calorie target",
  "Net carb limit",
  "Protein and fat grams",
  "Maintenance calorie estimate",
];

export const metadata = {
  title: "Keto Calculator - Keto Macros & Calories | ShedBody",
  description,
  keywords: [
    "keto calculator",
    "keto macro calculator",
    "ketogenic diet calculator",
    "net carbs calculator",
    "keto calories",
    "low carb macros",
    "keto protein target",
  ],
  alternates: { canonical: path },
  openGraph: { title: "Keto Calculator - ShedBody", description, url: path, siteName: "ShedBody", type: "website" },
  twitter: { card: "summary", title: "Keto Calculator - ShedBody", description },
};

export default function KetoCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={ketoCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">How the Keto Calculator Works</h2>
      <p>
        The calculator estimates BMR, adjusts for activity, applies your goal,
        then keeps net carbs low while assigning protein and fat targets.
      </p>
    </CalculatorSeoPage>
  );
}
