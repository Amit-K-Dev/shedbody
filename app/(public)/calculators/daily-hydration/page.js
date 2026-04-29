import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { dailyHydrationCalculator } from "@/lib/calculators/daily-hydration";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/daily-hydration`;

export const metadata = {
  title: "Daily Hydration Calculator - Water Intake | ShedBody",
  description:
    "Calculate daily water intake from body weight, exercise minutes, and climate. Estimate liters, cups, bottles, and fluid ounces.",
  keywords: [
    "daily hydration calculator",
    "water intake calculator",
    "how much water should I drink",
    "hydration calculator",
    "ShedBody hydration",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Daily Hydration Calculator - ShedBody",
    description:
      "Estimate daily water intake from weight, exercise time, and climate.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Daily Hydration Calculator - ShedBody",
    description:
      "Calculate liters, cups, bottles, and fluid ounces for daily hydration.",
  },
};

export default function DailyHydrationCalculatorPage() {
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
        name: "Daily Hydration Calculator",
        description:
          "Calculate daily water intake from body weight, exercise minutes, and climate.",
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
        name: "ShedBody Daily Hydration Calculator",
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
          "Daily water intake estimate",
          "Exercise hydration adjustment",
          "Climate hydration adjustment",
          "Cups, bottles, liters, and fluid ounces",
        ],
        description:
          "Estimate daily hydration needs using body weight, exercise duration, and climate conditions.",
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
            name: "Daily Hydration Calculator",
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
            name: "How does the hydration calculator work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It starts with an estimate of 35 ml per kilogram of body weight, then adds water for exercise time and warm or hot conditions.",
            },
          },
          {
            "@type": "Question",
            name: "Does exercise increase water needs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The calculator adds about 500 ml for every 30 minutes of exercise as a practical starting estimate.",
            },
          },
          {
            "@type": "Question",
            name: "Is this a medical hydration plan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. It is a general estimate. Fluid needs can change with sweat rate, medical conditions, medicines, pregnancy, and clinician advice.",
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
        <CalculatorEngine config={dailyHydrationCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Daily Hydration Calculator
          </h1>
          <p>
            Use this calculator to estimate how much water you may need per day
            based on your body weight, training time, and climate. The result
            includes liters, milliliters, cups, bottles, and fluid ounces.
          </p>

          <h2 className="text-xl font-bold text-zinc-50">
            How the Water Intake Estimate Works
          </h2>
          <p>
            ShedBody starts with a body-weight baseline, then adds a practical
            exercise adjustment and an extra climate adjustment for warm, humid,
            or heavy-sweat days.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Factor
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Why It Matters
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    Body weight
                  </td>
                  <td className="px-6 py-4">About 35 ml per kg</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Larger bodies usually need more total fluid.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    Exercise
                  </td>
                  <td className="px-6 py-4">About 500 ml per 30 minutes</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Training increases sweat and breathing losses.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-amber-300">
                    Climate
                  </td>
                  <td className="px-6 py-4">Extra water for heat or humidity</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Hot days can raise daily fluid needs.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Pair Hydration With Calories
            </h3>
            <p className="mt-2 text-zinc-400">
              Hydration supports training, appetite control, and recovery. Use
              the calorie calculator to align your nutrition target with your
              fitness goal.
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
