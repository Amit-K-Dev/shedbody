import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { weightWatchersPointsCalculator } from "@/lib/calculators/weight-watchers-points";

const title = "Weight Watchers Points Calculator";
const description =
  "Weight Watchers points calculator estimates from ShedBody help you turn nutrition labels into a practical points-style number. Enter calories, saturated fat, sugar, protein, fiber, and servings for an educational estimate.";
const path = "/calculators/weight-watchers-points";
const features = [
  "Estimated points per serving",
  "Recipe total points estimate",
  "Calories, saturated fat, sugar, protein, and fiber inputs",
  "Serving-based nutrition planning",
];

export const metadata = {
  title: "Weight Watchers Points Calculator | ShedBody",
  description,
  keywords: [
    "Weight Watchers points calculator",
    "WW points calculator",
    "weight watchers calculator",
    "food points calculator",
    "recipe points",
    "nutrition points",
    "points per serving",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "Weight Watchers Points Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Weight Watchers Points Calculator - ShedBody",
    description,
  },
};

export default function WeightWatchersPointsCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={weightWatchersPointsCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the Points Calculator Works
      </h2>
      <p>
        The calculator uses nutrition label values to create a points-style
        estimate, then divides by servings. It is useful for quick meal planning,
        but official program values may differ.
      </p>
    </CalculatorSeoPage>
  );
}
