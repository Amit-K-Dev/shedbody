import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { rmrCalculator } from "@/lib/calculators/rmr";

const title = "RMR Calculator - Resting Metabolic Rate";
const description =
  "RMR calculator estimates from ShedBody help you understand how many calories your body may burn at rest. Compare Mifflin-St Jeor and Revised Harris-Benedict formulas with simple activity context.";
const path = "/calculators/rmr";
const features = [
  "Resting metabolic rate estimate",
  "Mifflin-St Jeor equation",
  "Revised Harris-Benedict equation",
  "Low and moderate activity calorie context",
];

export const metadata = {
  title: "RMR Calculator - Resting Metabolic Rate | ShedBody",
  description,
  keywords: [
    "RMR calculator",
    "resting metabolic rate calculator",
    "rest metabolic rate calculator",
    "resting calories",
    "Mifflin St Jeor",
    "Harris Benedict equation",
    "metabolism calculator",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "RMR Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RMR Calculator - ShedBody",
    description,
  },
};

export default function RmrCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={rmrCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the RMR Calculator Works
      </h2>
      <p>
        The calculator converts your height and weight when needed, then applies
        the selected equation to estimate calories your body uses at rest. RMR
        is useful as a starting point before activity, training, and goal
        adjustments.
      </p>
    </CalculatorSeoPage>
  );
}
