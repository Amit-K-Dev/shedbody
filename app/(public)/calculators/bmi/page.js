import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { bmiCalculator } from "@/lib/calculators/bmi";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";

export const metadata = {
  title: "BMI Calculator (Body Mass Index) - Free & Accurate",
  description:
    "Use ShedBody BMI Calculator to check your body mass index instantly. Get accurate BMI results, health category, and fitness insights.",
  keywords: [
    "BMI calculator",
    "body mass index",
    "ideal weight calculator",
    "ShedBody BMI",
  ],
  alternates: {
    canonical: `${BASE_URL}/calculators/bmi`,
  },
};

export default async function BMICalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BMI Calculator",
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    url: `${BASE_URL}/calculators/bmi`,
    description: "Accurate BMI results, health category, and fitness insights.",
    isPartOf: {
      "@type": "WebSite",
      name: "ShedBody",
      url: BASE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="py-12 md:py-16 px-6">
        <CalculatorEngine config={bmiCalculator} />

        <section className="mt-12 max-w-3xl mx-auto text-zinc-300 space-y-4 leading-7">
          <h2 className="text-xl font-bold text-zinc-50">What is BMI?</h2>
          <p>
            Body Mass Index (BMI) is simple calculation using your height and
            weight to estimate body fat and assess your health category.
          </p>

          <div>
            <h2 className="text-xl font-bold text-zinc-50 mb-4">
              BMI Categories and Their Meaning
            </h2>
            <p className="mb-4">
              BMI results are grouped into categories that indicate potential
              health risks:
            </p>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
              <table className="w-full text-left">
                <thead className="bg-zinc-800 text-zinc-100 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-semibold" scope="col">
                      Category
                    </th>
                    <th className="px-6 py-3 font-semibold" scope="col">
                      BMI Range
                    </th>
                    <th className="px-6 py-3 font-semibold" scope="col">
                      Implications
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  <tr className="hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4">Underweight</td>
                    <td className="px-6 py-4">Less than 18.5</td>
                    <td className="px-6 py-4 text-zinc-400">
                      Risk of nutritional deficiency.
                    </td>
                  </tr>
                  <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 transition">
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      Normal weight
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400">
                      18.5 – 24.9
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      Ideal range for most adults.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Overweight</td>
                    <td className="px-4 py-2">25.0 – 29.9</td>
                    <td className="px-4 py-2">
                      May indicate increased risk of health problems.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Obesity (Class 1)</td>
                    <td className="px-4 py-2">30.0 – 34.9</td>
                    <td className="px-4 py-2">
                      Higher risk of weight-related conditions.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Obesity (Class 2)</td>
                    <td className="px-4 py-2">35.0 – 39.9</td>
                    <td className="px-4 py-2">
                      Significant health risks present.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Extreme Obesity</td>
                    <td className="px-4 py-2">40.0 and above</td>
                    <td className="px-4 py-2">
                      Severe risk of chronic illnesses.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p>
            These ranges apply to adults and help you understand weight-related
            health as a starting point.
          </p>

          {/* Registration Hook (Lead Magnet) */}
          <div className="bg-linear-to-r from-emerald-500/20 to-zinc-900 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-zinc-50 mb-2">
              Track Your Progress Automatically
            </h3>
            <p className="text-zinc-400 mb-6">
              Don't just calculate once. Save your results, see your BMI trend
              over time, and get personalized workout plans.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8 py-3 rounded-full transition shadow-lg shadow-emerald-500/20"
            >
              Create Free Account
            </Link>
          </div>

          <h2 className="text-xl font-bold text-zinc-50">
            How Does the BMI Calculator Work?
          </h2>
          <p>
            The BMI Calculator takes two simple inputs: your weight and height.
            Depending on your preference, you can input these measurements in
            either the metric system (kilograms and meters) or the imperial
            system (pounds and inches).
          </p>

          {/* Formulas & Limitations Section (Already Good) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-zinc-50">
              How is BMI Calculated?
            </h2>
            <p>BMI is calculated using the following mathematical formulas:</p>
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 font-mono text-sm">
              <p className="text-emerald-400">
                Metric: BMI = weight(kg) / height(m)²
              </p>
              <p className="text-zinc-500 mt-2">
                Imperial: BMI = (weight(lb) / height(in)²) × 703
              </p>
            </div>
          </div>

          <p>
            For example, if you weigh 70 kg and are 1.75 meters tall, your BMI
            would be:
          </p>
          <ul className="list-disc list-outside pl-6 marker:text-emerald-700">
            <li>BMI = 70 ÷ (1.75 × 1.75) = 22.86</li>
          </ul>

          <p>This result falls within the "normal weight" range.</p>

          <h2 className="text-xl font-bold text-zinc-50">
            Why Use a BMI Calculator?
          </h2>
          <p>
            The BMI Calculator is a quick and straightforward way to evaluate
            your weight relative to your height. Here are some reasons to use
            it:
          </p>

          <h3 className="text-lg font-bold text-zinc-50">
            1. Monitor Your Health
          </h3>
          <p>
            BMI serves as a general health indicator, helping you identify if
            your weight could be impacting your well-being.
          </p>

          <h3 className="text-lg font-bold text-zinc-50">
            2. Set Fitness Goals
          </h3>
          <p>
            If you’re starting a fitness journey, knowing your BMI can help you
            set realistic weight targets.
          </p>

          <h3 className="text-lg font-bold text-zinc-50">
            3. Track Changes Over Time
          </h3>
          <p>
            Regularly checking your BMI can help you measure progress as you
            work toward a healthier lifestyle.
          </p>

          <h3 className="text-lg font-bold text-zinc-50">
            4. Aid in Conversations with Healthcare Professionals
          </h3>
          <p>
            Your BMI provides a helpful context for discussions with doctors or
            dietitians about your health and nutrition.
          </p>

          <h2 className="text-xl font-bold text-zinc-50">
            BMI for Adults vs. Children
          </h2>

          <h3 className="text-lg font-bold text-zinc-50">Adults</h3>
          <p>
            For adults aged 18 and older, BMI categories are the same regardless
            of age or gender.
          </p>

          <h3 className="text-lg font-bold text-zinc-50">Children and Teens</h3>
          <p>
            For children and teenagers, we interpret BMI differently by
            comparing it to standardized growth charts based on age and gender.
            This accounts for changes in body composition as kids grow. A
            child’s BMI is expressed as a percentile rather than a fixed number.
          </p>

          <h2 className="text-xl font-bold text-zinc-50">Limitations of BMI</h2>
          <p>
            While BMI is a useful tool, it’s not perfect. Here are some of its
            limitations:
          </p>

          <ul className="list-disc list-outside pl-6 marker:text-emerald-700">
            <li>
              <strong>Not a Standalone Health Measure:</strong>
              <ul className="list-disc list-outside pl-6 marker:text-emerald-700">
                <li>
                  BMI doesn’t account for other factors like age, genetics, bone
                  density, or lifestyle. It’s best used alongside other health
                  metrics.
                </li>
              </ul>
            </li>

            <li>
              <strong>Doesn’t Differentiate Between Fat and Muscle:</strong>
              <ul className="list-disc list-outside pl-6 marker:text-emerald-700">
                <li>
                  Muscle weighs more than fat, so athletes with high muscle mass
                  may have a high BMI without being overweight.
                </li>
              </ul>
            </li>

            <li>
              <strong>Doesn’t Consider Fat Distribution:</strong>
              <ul className="list-disc list-outside pl-6 marker:text-emerald-700">
                <li>
                  BMI doesn’t indicate where the body stores fat, which can
                  impact health risks. For example, abdominal fat poses greater
                  risks than fat stored elsewhere.
                </li>
              </ul>
            </li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-50">
            How to Use the BMI Calculator Effectively
          </h2>
          <p>Here’s a quick guide to using the BMI Calculator:</p>

          <ul className="list-disc list-outside pl-6 marker:text-emerald-700">
            <li>
              <strong>Use as a Starting Point</strong>: If your BMI falls
              outside the “normal” range, consider discussing your results with
              a healthcare professional for more personalized advice.
            </li>

            <li>
              <strong>Input Your Details</strong>: Enter your weight and height
              in either{" "}
              <Link
                href="/calculators/calories-calculator"
                className="text-emerald-400 no-underline hover:text-emerald-300 transition"
              >
                metric or imperial units
              </Link>
              .
            </li>

            <li>
              <strong>View Your Result</strong>: The calculator will display
              your BMI value.
            </li>

            <li>
              <strong>Compare to BMI Categories</strong>: Match your BMI to the
              categories to see where you fall.
            </li>
          </ul>

          <p className="border-l-4 border-emerald-500 bg-emerald-500/10 rounded-lg p-4">
            The BMI Calculator is a helpful tool for quickly understanding
            whether your weight is within a healthy range. While it’s not a
            perfect measure of health, it’s a great starting point for
            evaluating your weight and setting health goals. Remember, BMI is
            just one piece of the puzzle—combine it with other health metrics
            and professional advice for a more complete picture of your
            well-being.
          </p>
        </section>
      </section>
    </>
  );
}
