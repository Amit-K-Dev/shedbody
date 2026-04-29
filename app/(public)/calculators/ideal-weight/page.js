import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { idealWeightCalculator } from "@/lib/calculators/ideal-weight";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/ideal-weight`;

export const metadata = {
  title: "Ideal Weight Calculator - Healthy Weight Range | ShedBody",
  description:
    "Ideal weight calculator estimates from ShedBody give you a useful target range, not a rigid rule. Compare height, gender, BMI range, and reference formulas in one place.",
  keywords: [
    "ideal weight calculator",
    "healthy weight calculator",
    "ideal body weight calculator",
    "IBW calculator",
    "height weight calculator",
    "BMI weight range",
    "medical weight formulas",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Ideal Weight Calculator - ShedBody",
    description:
      "Estimate ideal body weight, formula averages, and healthy BMI weight range.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ideal Weight Calculator - ShedBody",
    description:
      "Estimate your ideal body weight and healthy weight range by height and gender.",
  },
};

export default function IdealWeightCalculatorPage() {
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
        name: "Ideal Weight Calculator",
        description:
          "Estimate ideal body weight and healthy weight range using height, gender, and trusted reference formulas.",
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
        name: "ShedBody Ideal Weight Calculator",
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
          "Ideal body weight estimate",
          "Healthy BMI weight range",
          "Devine formula",
          "Robinson formula",
          "Miller formula",
          "Hamwi formula",
        ],
        description:
          "Estimate ideal weight using multiple medical reference formulas and compare it with a healthy BMI range.",
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
            name: "Ideal Weight Calculator",
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
            name: "How does the ideal weight calculator work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It estimates ideal body weight from height and gender using Devine, Robinson, Miller, and Hamwi reference formulas, then averages the results and shows a practical range.",
            },
          },
          {
            "@type": "Question",
            name: "Is ideal weight the same for everyone at the same height?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Ideal weight is only a reference estimate. Body composition, muscle mass, age, frame size, and medical history can change a healthy target.",
            },
          },
          {
            "@type": "Question",
            name: "What is a healthy BMI weight range?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A common adult BMI reference range is 18.5 to 24.9. This calculator converts that BMI range into a weight range for your height.",
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
        <CalculatorEngine config={idealWeightCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Ideal Weight Calculator
          </h1>
          <p>
            Use this calculator to estimate a realistic ideal body weight from
            your height and gender. ShedBody compares multiple well-known ideal
            body weight formulas, averages them, and also shows the weight range
            linked with a healthy adult BMI.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Formula
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Uses
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Best For
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    Devine
                  </td>
                  <td className="px-6 py-4">Height and gender</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Common clinical ideal body weight reference.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    Robinson
                  </td>
                  <td className="px-6 py-4">Height and gender</td>
                  <td className="px-6 py-4 text-zinc-400">
                    A slightly updated ideal weight estimate.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-amber-300">
                    Miller and Hamwi
                  </td>
                  <td className="px-6 py-4">Height and gender</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Useful comparison points for a broader range.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-zinc-50">
            How the Ideal Weight Calculator Works
          </h2>
          <p>
            The calculator converts your height to inches, applies the Devine,
            Robinson, Miller, and Hamwi equations, then shows the average as the
            main estimate. The suggested range is set around that average so you
            can treat the result as a flexible target instead of one strict
            number.
          </p>

          <h2 className="text-xl font-bold text-zinc-50">
            Ideal Weight vs BMI
          </h2>
          <p>
            Ideal weight formulas are quick references, while BMI relates weight
            to height. For a fuller picture, compare this result with the{" "}
            <Link
              href="/calculators/bmi"
              className="text-emerald-400 no-underline transition hover:text-emerald-300"
            >
              BMI Calculator
            </Link>{" "}
            and your real health markers, strength, energy, and body
            composition.
          </p>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Build a Practical Weight Plan
            </h3>
            <p className="mt-2 text-zinc-400">
              Once you know your estimated target range, use the calorie
              calculator to set a daily intake for fat loss, maintenance, or
              muscle gain.
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
