import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { eerCalculator } from "@/lib/calculators/eer";

const title = "EER Calculator - Estimated Energy Requirement";
const description =
  "EER calculator estimates from ShedBody help you understand daily energy needs using age, body size, activity, and life stage. Calculate estimated energy requirement with practical calorie targets for maintenance, fat loss, or muscle gain.";
const path = "/calculators/eer";
const features = [
  "Estimated energy requirement",
  "Activity coefficient based calculation",
  "Pregnancy and breastfeeding adjustment",
  "Maintenance, fat loss, and muscle gain calorie targets",
];

export const metadata = {
  title: "EER Calculator - Estimated Energy Requirement | ShedBody",
  description,
  keywords: [
    "EER calculator",
    "estimated energy requirement calculator",
    "energy requirement calculator",
    "daily energy needs",
    "activity coefficient",
    "maintenance calories",
    "calorie target",
  ],
  alternates: { canonical: path },
  openGraph: {
    title: "EER Calculator - ShedBody",
    description,
    url: path,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "EER Calculator - ShedBody",
    description,
  },
};

export default function EerCalculatorPage() {
  return (
    <CalculatorSeoPage
      config={eerCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">
        How the EER Calculator Works
      </h2>
      <p>
        The calculator uses estimated energy requirement equations with body
        size, age, gender, and activity coefficient. For adult women, pregnancy
        or breastfeeding can add a simple life-stage calorie adjustment.
      </p>
    </CalculatorSeoPage>
  );
}
