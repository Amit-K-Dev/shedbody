import CalculatorSeoPage from "../_components/CalculatorSeoPage";
import { caloriesBurnedByActivityCalculator } from "@/lib/calculators/calories-burned-by-activity";

const title = "Calories Burned by Activity";
const description =
  "Use ShedBody Calories Burned by Activity to estimate exercise calorie burn from body weight, duration, and activity type including walking, running, cycling, yoga, HIIT, and swimming.";
const path = "/calculators/calories-burned-by-activity";
const features = [
  "Calories burned estimate",
  "Walking, running, cycling, yoga, swimming, HIIT, and strength training",
  "Metric and imperial units",
  "Calories per minute and MET value",
];

export const metadata = {
  title: "Calories Burned by Activity Calculator | ShedBody",
  description,
  keywords: ["calories burned calculator", "exercise calorie calculator", "activity calorie burn", "MET calculator"],
  alternates: { canonical: path },
  openGraph: { title: "Calories Burned by Activity - ShedBody", description, url: path, siteName: "ShedBody", type: "website" },
  twitter: { card: "summary", title: "Calories Burned by Activity - ShedBody", description },
};

export default function CaloriesBurnedByActivityPage() {
  return (
    <CalculatorSeoPage
      config={caloriesBurnedByActivityCalculator}
      title={title}
      description={description}
      path={path}
      features={features}
    >
      <h2 className="text-xl font-bold text-zinc-50">How the Activity Calculator Works</h2>
      <p>
        The calculator uses MET values with your body weight and activity time
        to estimate total calories burned and average calories per minute.
      </p>
    </CalculatorSeoPage>
  );
}
