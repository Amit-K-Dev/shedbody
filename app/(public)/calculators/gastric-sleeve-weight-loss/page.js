import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { gastricSleeveWeightLossCalculator } from "@/lib/calculators/gastric-sleeve-weight-loss";

const title = "Gastric Sleeve Weight Loss Calculator";
const description =
  "Gastric sleeve weight loss calculator estimates from ShedBody help you understand possible post-surgery weight change with realistic context. Enter surgery weight, current weight, height, months since surgery, and expected excess weight loss.";
const path = "/calculators/gastric-sleeve-weight-loss";
const features = [
  "Projected gastric sleeve weight loss",
  "Excess weight loss percentage estimate",
  "Progress toward expected loss",
  "3, 6, 12, and 18 month milestone estimates",
];

export const metadata = {
  title: "Gastric Sleeve Weight Loss Calculator | ShedBody",
  description,
  keywords: [
    "gastric sleeve weight loss calculator",
    "gastric sleeve calculator",
    "bariatric weight loss calculator",
    "excess weight loss",
    "sleeve gastrectomy weight loss",
    "post surgery weight loss",
    "weight loss surgery estimate",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "Gastric Sleeve Weight Loss Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gastric Sleeve Weight Loss Calculator - ShedBody",
    description,
  },
};

export default function GastricSleeveWeightLossCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={gastricSleeveWeightLossCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the Gastric Sleeve Calculator Works
      </h2>
      <p>
        The calculator estimates excess weight above a healthy BMI reference,
        applies your selected expected excess weight loss percentage, then shows
        projected loss and milestone ranges. Always use your surgical team's
        guidance for medical decisions.
      </p>
    </CalculatorSeoPage>
  );
}
