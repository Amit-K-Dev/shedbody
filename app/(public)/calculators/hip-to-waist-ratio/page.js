import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { hipToWaistRatioCalculator } from "@/lib/calculators/hip-to-waist-ratio";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/hip-to-waist-ratio`;

export const metadata = {
  title: "Hip-to-Waist Ratio Calculator - HWR & WHR | ShedBody",
  description:
    "Hip to waist ratio calculator results can make body measurements easier to interpret. Enter waist and hip size to estimate HWR, WHR, and a simple risk category.",
  keywords: [
    "hip to waist ratio calculator",
    "waist to hip ratio calculator",
    "HWR calculator",
    "WHR calculator",
    "waist measurement",
    "hip measurement",
    "body fat risk",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Hip-to-Waist Ratio Calculator - ShedBody",
    description:
      "Calculate HWR, WHR, and a waist-to-hip risk category from body measurements.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hip-to-Waist Ratio Calculator - ShedBody",
    description:
      "Calculate hip-to-waist ratio, waist-to-hip ratio, and body measurement category.",
  },
};

export default function HipToWaistRatioCalculatorPage() {
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
        name: "Hip-to-Waist Ratio Calculator",
        description:
          "Calculate hip-to-waist ratio and waist-to-hip ratio from waist and hip measurements.",
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
        name: "ShedBody Hip-to-Waist Ratio Calculator",
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
          "Hip-to-waist ratio",
          "Waist-to-hip ratio",
          "Body measurement category",
          "Metric and imperial units",
        ],
        description:
          "Calculate HWR and WHR from waist and hip measurements.",
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
            name: "Hip-to-Waist Ratio Calculator",
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
            name: "What is hip-to-waist ratio?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Hip-to-waist ratio divides hip measurement by waist measurement. This calculator also shows waist-to-hip ratio, which is commonly used for health risk categories.",
            },
          },
          {
            "@type": "Question",
            name: "What is the difference between HWR and WHR?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "HWR is hip divided by waist. WHR is waist divided by hip. They are inverse values, and WHR is more commonly used in public health references.",
            },
          },
          {
            "@type": "Question",
            name: "How should I measure waist and hip?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Measure waist around the narrowest point or near the navel, and hip around the widest part of the hips. Keep the tape level and relaxed.",
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
        <CalculatorEngine config={hipToWaistRatioCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Hip-to-Waist Ratio Calculator
          </h1>
          <p>
            Use this calculator to find your hip-to-waist ratio and the related
            waist-to-hip ratio. HWR divides hip by waist, while WHR divides
            waist by hip and is often used to understand abdominal fat pattern.
          </p>

          <h2 className="text-xl font-bold text-zinc-50">
            HWR and WHR Formula
          </h2>
          <p>
            Hip-to-waist ratio is hip measurement divided by waist measurement.
            Waist-to-hip ratio is waist measurement divided by hip measurement.
            Both use the same unit, so centimeters and inches work equally well.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Metric
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Formula
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Use
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    HWR
                  </td>
                  <td className="px-6 py-4">Hip / waist</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Shows hip measurement relative to waist.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    WHR
                  </td>
                  <td className="px-6 py-4">Waist / hip</td>
                  <td className="px-6 py-4 text-zinc-400">
                    Common reference for abdominal fat distribution.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Compare With BMI and Ideal Weight
            </h3>
            <p className="mt-2 text-zinc-400">
              Body measurements are most useful when viewed with weight, BMI,
              training progress, and energy levels.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/calculators/bmi"
                className="inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
              >
                Calculate BMI
              </Link>
              <Link
                href="/calculators/ideal-weight"
                className="inline-flex rounded-full border border-emerald-500/40 px-6 py-3 font-bold text-emerald-300 transition hover:bg-emerald-500/10"
              >
                Ideal Weight
              </Link>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
