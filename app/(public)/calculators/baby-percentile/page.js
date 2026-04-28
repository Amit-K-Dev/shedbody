import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { babyPercentileCalculator } from "@/lib/calculators/baby-percentile";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/baby-percentile`;

export const metadata = {
  title: "Baby Percentile Calculator - ShedBody",
  description:
    "Estimate baby weight, length, or head circumference percentile from birth to 24 months using sex, age, and measurement.",
  keywords: [
    "baby percentile calculator",
    "infant growth chart",
    "baby weight percentile",
    "baby length percentile",
    "head circumference percentile",
    "WHO growth chart",
    "baby growth calculator",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Baby Percentile Calculator - ShedBody",
    description:
      "Estimate baby weight, length, or head circumference percentile from birth to 24 months.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Baby Percentile Calculator - ShedBody",
    description:
      "Estimate baby growth percentile by sex, age, and measurement.",
  },
};

export default function BabyPercentileCalculatorPage() {
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
        "@type": "MedicalWebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Baby Percentile Calculator",
        description:
          "Estimate infant weight, length, or head circumference percentile from birth to 24 months.",
        isPartOf: {
          "@id": `${BASE_URL}/#website`,
        },
        breadcrumb: {
          "@id": `${PAGE_URL}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${PAGE_URL}#calculator`,
        },
        audience: {
          "@type": "MedicalAudience",
          audienceType: "Parents and caregivers",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${PAGE_URL}#calculator`,
        name: "ShedBody Baby Percentile Calculator",
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
          "Weight-for-age percentile estimate",
          "Length-for-age percentile estimate",
          "Head circumference percentile estimate",
          "Metric and imperial unit support",
          "Reference percentile band comparison",
        ],
        description:
          "Estimate baby growth percentile using age, sex, measurement type, and measurement value.",
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
            name: "Baby Percentile Calculator",
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
            name: "What does a baby percentile mean?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A percentile compares a baby's measurement with a reference growth chart for babies of the same age and sex. For example, the 50th percentile is close to the chart median.",
            },
          },
          {
            "@type": "Question",
            name: "Which measurements can this calculator estimate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It can estimate weight-for-age, length-for-age, and head circumference-for-age percentiles for babies from birth to 24 months.",
            },
          },
          {
            "@type": "Question",
            name: "Should one percentile result be used as a diagnosis?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Pediatric clinicians usually interpret growth patterns over time, measurement accuracy, feeding, health history, and exam findings.",
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
        <CalculatorEngine config={babyPercentileCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Baby Percentile Calculator
          </h1>
          <p>
            Estimate your baby&apos;s weight, length, or head circumference
            percentile from birth to 24 months. Percentiles are best used to
            understand growth patterns over time, not to judge one measurement
            in isolation.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Measurement
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Use
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Unit Options
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    Weight-for-age
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    Tracks body weight compared with age and sex.
                  </td>
                  <td className="px-6 py-4">kg or lb</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    Length-for-age
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    Tracks baby length compared with age and sex.
                  </td>
                  <td className="px-6 py-4">cm or in</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-amber-300">
                    Head circumference
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    Tracks head growth compared with age and sex.
                  </td>
                  <td className="px-6 py-4">cm or in</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-zinc-50">
            How the Baby Percentile Calculator Works
          </h2>
          <p>
            The calculator compares the entered measurement with simplified
            WHO-style reference bands for babies from 0 to 24 months. It then
            estimates the nearest percentile and shows the broad reference
            range for context.
          </p>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Growth Trends Matter Most
            </h3>
            <p className="mt-2 text-zinc-400">
              A single percentile does not diagnose health. Ask a pediatric
              clinician if measurements cross percentile bands, seem unusual, or
              do not match feeding, development, or health history.
            </p>
            <Link
              href="/contact-us"
              className="mt-5 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
            >
              Contact ShedBody
            </Link>
          </div>
        </section>
      </section>
    </>
  );
}
