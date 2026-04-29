import Link from "next/link";
import CalculatorEngine from "@/components/calculator/CalculatorEngine";

const BASE_URL = "https://shedbody.com";

export function buildCalculatorSchema({
  title,
  description,
  path,
  features = [],
}) {
  const pageUrl = `${BASE_URL}${path}`;

  return {
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
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { "@id": `${BASE_URL}/#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#calculator` },
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#calculator`,
        name: `ShedBody ${title}`,
        applicationCategory: "HealthApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        url: pageUrl,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: features,
        description,
        potentialAction: {
          "@type": "UseAction",
          target: pageUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Calculators",
            item: `${BASE_URL}/calculators`,
          },
          { "@type": "ListItem", position: 3, name: title, item: pageUrl },
        ],
      },
    ],
  };
}

export default function CalculatorSeoPage({
  config,
  title,
  description,
  path,
  features,
  children,
}) {
  const schema = buildCalculatorSchema({ title, description, path, features });

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="px-6 py-12 md:py-16">
        <CalculatorEngine config={config} />

        <section className="mx-auto mt-12 max-w-3xl space-y-5 text-zinc-300 leading-7">
          <h1 className="text-2xl font-black tracking-tight text-zinc-50">
            {title}
          </h1>
          <p>{description}</p>

          {features?.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="grid divide-y divide-zinc-800 text-sm">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 px-5 py-4"
                  >
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {children}

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h2 className="text-lg font-bold text-zinc-50">
              Explore More ShedBody Tools
            </h2>
            <p className="mt-2 text-zinc-400">
              Use the complete calculator archive for body metrics, nutrition
              planning, hydration, pregnancy, baby growth, and exercise burn.
            </p>
            <Link
              href="/calculators"
              className="mt-5 inline-flex rounded-full bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
            >
              View All Calculators
            </Link>
          </div>
        </section>
      </section>
    </>
  );
}
