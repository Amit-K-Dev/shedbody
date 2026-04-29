import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { calorieCalculator } from "@/lib/calculators/calorie";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/calorie`;
const PAGE_IMAGE = `${BASE_URL}/food-table.jpg`;

export const metadata = {
  title: "Calorie Calculator with Macros & Diet Plans - ShedBody",
  description:
    "Calorie calculator estimates from ShedBody help you set a realistic daily intake. Check BMR, TDEE, macros, and goal-based calories for fat loss, maintenance, or muscle gain.",
  keywords: [
    "calorie calculator",
    "daily calorie calculator",
    "tdee calculator",
    "bmr calculator",
    "macro calculator",
    "maintenance calories",
    "fat loss calories",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Calorie Calculator with Macros & Diet Plans - ShedBody",
    description:
      "Estimate calories, macros, BMR, TDEE, and compare diet plans for fat loss, maintenance, and muscle gain.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
    images: [
      {
        url: PAGE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Healthy meal table for calorie and macro planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calorie Calculator with Macros & Diet Plans - ShedBody",
    description:
      "Calculate calories, macros, BMR, TDEE, and compare goal-based diet plans.",
    images: [PAGE_IMAGE],
  },
};

export default function CalorieCalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "ShedBody",
        url: BASE_URL,
        publisher: {
          "@id": `${BASE_URL}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "ShedBody",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/android-chrome-512x512.png`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Calorie Calculator with Macros & Diet Plans",
        description:
          "Calculate daily calories, BMR, TDEE, macros, and compare fat loss, maintenance, and muscle gain diet plans.",
        isPartOf: {
          "@id": `${BASE_URL}/#website`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: PAGE_IMAGE,
          width: 1200,
          height: 630,
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
        name: "ShedBody Calorie Calculator",
        applicationCategory: "HealthApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        url: PAGE_URL,
        image: PAGE_IMAGE,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "BMR calculation",
          "TDEE calculation",
          "Daily calorie target",
          "Protein, carbs, and fats breakdown",
          "Fat loss, maintenance, and muscle gain diet plan comparison",
        ],
        description:
          "Estimate calories, macros, BMR, TDEE, and compare goal-based diet plans using ShedBody fitness protocols.",
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
            item: `${BASE_URL}/calculators/calorie`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Calorie Calculator",
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
            name: "What does the ShedBody calorie calculator show?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It estimates BMR, TDEE, daily calories, macro targets, BMI category, and compares fat loss, maintenance, and muscle gain diet plans.",
            },
          },
          {
            "@type": "Question",
            name: "Does the calculator suggest diet plans?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. It suggests goal-based diet plans from the ShedBody diet library and highlights the best match based on the selected goal and user details.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use vegetarian or non-vegetarian diet preferences?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. The calculator can match vegetarian or non-vegetarian plans when those diet templates are available.",
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
        <CalculatorEngine config={calorieCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Calorie Calculator for Daily Targets and Macros
          </h1>
          <p>
            This calculator estimates your basal metabolic rate, adjusts it for
            your activity level, then applies your goal to create a practical
            daily calorie target. It also shows protein, carbs, and fats so the
            number is easier to turn into real meals.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Goal
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Calorie Strategy
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Best Use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    Fat loss
                  </td>
                  <td className="px-6 py-4">Moderate deficit</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Losing fat while preserving muscle.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    Maintenance
                  </td>
                  <td className="px-6 py-4">TDEE baseline</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Recomposition, performance, and habit tracking.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-amber-300">
                    Muscle gain
                  </td>
                  <td className="px-6 py-4">Controlled surplus</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Supporting recovery and lean mass gain.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-zinc-50">
            How the Calorie Calculator Works
          </h2>
          <p>
            ShedBody uses the Mifflin-St Jeor equation to estimate BMR, then
            multiplies it by activity level to estimate TDEE. Your selected goal
            changes the final calorie target, and the nearest matching diet
            template is pulled from the ShedBody diet library.
          </p>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Save Your Calorie Progress
            </h3>
            <p className="mt-2 text-zinc-400">
              Logged-in users can save calculator results and track calorie
              targets over time from the same calculator ecosystem as BMI.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </section>
    </>
  );
}
