import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { weightGoalCalculator } from "@/lib/calculators/weight-goal";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/weight-goal`;

export const metadata = {
  title: "Weight Goal Calculator - Timeline Planner | ShedBody",
  description:
    "Weight goal calculator timelines from ShedBody help you plan progress at a realistic pace. Estimate how many weeks your target may take from current weight, goal weight, and weekly change.",
  keywords: [
    "weight goal calculator",
    "weight loss timeline calculator",
    "target weight calculator",
    "weight gain calculator",
    "weekly weight loss",
    "goal weight planner",
    "fitness timeline",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Weight Goal Calculator - ShedBody",
    description:
      "Estimate your target weight timeline from current weight, goal weight, and weekly pace.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Weight Goal Calculator - ShedBody",
    description:
      "Plan a weight loss, gain, or maintenance timeline with a weekly pace.",
  },
};

export default function WeightGoalCalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "ShedBody",
        url: BASE_URL,
      },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Weight Goal Calculator",
        description:
          "Estimate how long it may take to reach a target weight using current weight and weekly progress pace.",
        isPartOf: {
          "@id": `${BASE_URL}/#website`,
        },
        breadcrumb: {
          "@id": `${PAGE_URL}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${PAGE_URL}#calculator`,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${PAGE_URL}#calculator`,
        name: "ShedBody Weight Goal Calculator",
        applicationCategory: "HealthApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        url: PAGE_URL,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Weight goal timeline",
          "Target date estimate",
          "Weekly pace planning",
          "Weight loss and weight gain support",
        ],
        description:
          "Calculate weeks to goal from current weight, target weight, and selected weekly progress pace.",
        potentialAction: {
          "@type": "UseAction",
          target: PAGE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: PAGE_URL,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Weight Goal Calculator",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How does the weight goal calculator work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It divides the difference between current weight and target weight by the selected weekly pace to estimate weeks to goal and a target date.",
            },
          },
          {
            "@type": "Question",
            name: "What is a realistic weekly weight change?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Many people use a moderate pace such as about 0.25 to 1 kg per week or about 0.5 to 2 lb per week, depending on health status and goals.",
            },
          },
          {
            "@type": "Question",
            name: "Can this calculator help with weight gain?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. If your target weight is higher than your current weight, it estimates a weight gain timeline using the same weekly pace method.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="px-6 py-12 md:py-16">
        <CalculatorEngine config={weightGoalCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Weight Goal Calculator
          </h1>
          <p>
            Use this calculator to estimate how long it may take to move from
            your current weight to your target weight. It works for fat loss,
            weight gain, and maintenance planning.
          </p>

          <h2 className="text-xl font-bold text-zinc-50">
            How the Goal Timeline Works
          </h2>
          <p>
            ShedBody subtracts your target weight from your current weight, then
            divides the change by your selected weekly pace. The result is a
            practical week-by-week timeline and estimated target date.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Goal
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Pace Focus
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Next Step
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    Fat loss
                  </td>
                  <td className="px-6 py-4">Moderate weekly decrease</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Use a calorie deficit and strength training.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    Weight gain
                  </td>
                  <td className="px-6 py-4">Controlled weekly increase</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Use a calorie surplus and progressive training.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-amber-300">
                    Maintenance
                  </td>
                  <td className="px-6 py-4">Stable body weight</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Track habits, measurements, and performance.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Turn the Timeline Into Calories
            </h3>
            <p className="mt-2 text-zinc-400">
              After choosing a timeline, calculate a daily calorie target that
              supports the same pace.
            </p>
            <Link
              href="/calculators/calorie"
              className="mt-5 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
            >
              Calculate Calories
            </Link>
          </div>
        </section>
      </section>
    </>
  );
}
