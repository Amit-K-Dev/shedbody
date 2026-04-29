import CalculatorEngine from "@/components/calculator/CalculatorEngine";
import { pregnancyCalculator } from "@/lib/calculators/pregnancy";
import Link from "next/link";

const BASE_URL = "https://shedbody.com";
const PAGE_URL = `${BASE_URL}/calculators/pregnancy`;

export const metadata = {
  title: "Pregnancy Due Date Calculator - ShedBody",
  description:
    "Pregnancy calculator estimates from ShedBody help you map your due date with calm, clear context. Check pregnancy week, trimester, conception date, and milestones from LMP or conception.",
  keywords: [
    "pregnancy calculator",
    "due date calculator",
    "pregnancy due date calculator",
    "pregnancy week calculator",
    "gestational age calculator",
    "trimester calculator",
    "LMP calculator",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Pregnancy Due Date Calculator - ShedBody",
    description:
      "Estimate due date, pregnancy week, trimester, and milestones using LMP or conception date.",
    url: PAGE_URL,
    siteName: "ShedBody",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pregnancy Due Date Calculator - ShedBody",
    description:
      "Estimate your due date, pregnancy week, trimester, and key milestones.",
  },
};

export default function PregnancyCalculatorPage() {
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
        name: "Pregnancy Due Date Calculator",
        description:
          "Estimate pregnancy due date, gestational age, trimester, conception date, and key pregnancy milestones.",
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
          audienceType: "Patients",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${PAGE_URL}#calculator`,
        name: "ShedBody Pregnancy Calculator",
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
          "Estimated due date",
          "Current pregnancy week",
          "Trimester estimate",
          "Estimated conception date",
          "Pregnancy milestone timeline",
        ],
        description:
          "Calculate an estimated pregnancy due date from LMP or conception date.",
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
            item: `${BASE_URL}/calculators/pregnancy`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Pregnancy Calculator",
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
            name: "How is a pregnancy due date estimated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A common estimate counts 280 days, or 40 weeks, from the first day of the last menstrual period. If conception date is known, the estimate is about 266 days from conception.",
            },
          },
          {
            "@type": "Question",
            name: "Is this calculator a medical diagnosis?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. It provides an estimate only. A clinician may confirm or adjust pregnancy dating using ultrasound and medical history.",
            },
          },
          {
            "@type": "Question",
            name: "Can cycle length affect the due date estimate?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. LMP-based estimates often assume a 28-day cycle, so longer or shorter cycles can shift the estimated ovulation and due date.",
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
        <CalculatorEngine config={pregnancyCalculator} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            Pregnancy Due Date Calculator
          </h1>
          <p>
            Use this calculator to estimate your due date, pregnancy week,
            trimester, conception timing, and key pregnancy milestones. You can
            calculate from the first day of your last menstrual period or from a
            known conception date.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-zinc-100">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Method
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Estimate
                  </th>
                  <th className="px-6 py-3 font-semibold" scope="col">
                    Best When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    Last menstrual period
                  </td>
                  <td className="px-6 py-4">About 280 days from LMP</td>
                  <td className="px-6 py-4 text-zinc-400">
                    You know the first day of your last period.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-sky-300">
                    Conception date
                  </td>
                  <td className="px-6 py-4">About 266 days from conception</td>
                  <td className="px-6 py-4 text-zinc-400">
                    You have a reliable conception or ovulation date.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-zinc-50">
            How the Pregnancy Calculator Works
          </h2>
          <p>
            The calculator uses common pregnancy dating rules for estimates. LMP
            dating assumes a 40-week pregnancy from the first day of the last
            menstrual period, with cycle-length adjustment. Conception-date
            dating estimates 38 weeks from conception.
          </p>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h3 className="text-lg font-bold text-zinc-50">
              Confirm Dates With a Clinician
            </h3>
            <p className="mt-2 text-zinc-400">
              Pregnancy dating can change after ultrasound or medical review.
              Use this as a planning estimate, not a diagnosis.
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
