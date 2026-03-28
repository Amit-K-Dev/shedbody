import Link from "next/link";

export const metadata = {
  title: "Editorial Process",
  description:
    "ShedBody content is created using trusted scientific research, peer-reviewed studies, and reputable health sources.",

  keywords: [
    "Editorial Process",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/editorial-process",
  },
};

export default function EditorialPolicy() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EditorialProcessPage",
    name: "Editorial Process",
    url: "https://shedbody.com/editorial-process",
    description:
      "ShedBody content is created using trusted scientific research, peer-reviewed studies, and reputable health sources.",
    isPartOf: {
      "@type": "WebSite",
      name: "ShedBody",
      url: "https://shedbody.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main>
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-6">
            <article className="max-w-2xl mx-auto space-y-8 text-gray-300 leading-relaxed">
              <header className="text-center space-y-4">
                {/* Article Header */}
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Editorial Process
                </h1>

                <p className="max-w-2xl mx-auto text-lg">
                  At{" "}
                  <Link
                    href="/"
                    className="text-green-400 no-underline hover:text-green-300"
                  >
                    ShedBody
                  </Link>
                  , our content is created using trusted scientific research,
                  peer-reviewed studies, and reputable health sources.
                </p>
              </header>

              {/* Content Sctions */}
              <div className="space-y-4">
                <p>
                  There is no one-size-fits-all model for healthy living. Let us
                  help you find a way to eat well and stay active which is on
                  your journey.
                </p>

                <p>
                  Small, everyday choices about your food, fitness, and overall
                  health have the power to change your life. But this does not
                  mean that they are always easy to maintain. We understand you
                  as a person with specific goals and we are here to support you
                  with reliable information and tools to help you give your best
                  experience.
                </p>

                <p>
                  Online searches for nutrition or exercise topics can be
                  overwhelming and result in a black hole of fake fads and false
                  claims. You need easy-to-understand and reliable advice that
                  cuts through the clutter - advice that has been written by
                  experts who know what they are talking about and whose Take
                  care.
                </p>

                <p>
                  It is our duty and responsibility to ensure that you are
                  receiving science-backed facts with clear, actionable steps
                  suited to your needs. We work hard to break down complex
                  health conditions, reflect the latest research, and present
                  the most accurate information in a way that inspires you to
                  play an active role in your diet and fitness. We are here to
                  make you happy, not to scare you.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Subject matter writer
                </h2>

                <p>
                  Our authors are notable voices in their respective
                  disciplines, from registered dieticians to certified personal
                  trainers to physicians. These leading experts are particularly
                  chosen for their extensive knowledge and real-world
                  experience, as well as their ability to communicate complex
                  information in a clear, helpful and unbiased manner.
                </p>

                <p>
                  We have a new way to help all people navigate their health and
                  wellbeing regardless of race, gender identity, sexual
                  orientation, age, religion, culture, geography, body type,
                  ability, or experience. Commitment. We are working with BIPOC
                  health writers, review board members, expert sources,
                  illustrators, photographers, and to create, edit and enhance
                  our content - not only on different topics of race, but on our
                  brand coverage.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Editorial team
                </h2>

                <p>
                  Our highly-skilled editorial team manages all the content you
                  read. Each person&apos;s article has many people behind it
                  working to ensure it is accurate, understandable, helpful,
                  reliable, comprehensive, up-to-date and inclusive.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Fact check
                </h2>

                <p>
                  Our team of qualified and experienced fact checkers provides
                  an important step in our commitment to content integrity. Fact
                  checkers rigorously review medical statements, claims, and
                  recommendations for accuracy and timeliness. We rely only on
                  the most current and prestigious primary references, including
                  peer-reviewed medical journals, government organizations,
                  educational institutions, and advocacy associations. The
                  sources are listed inline and at the bottom of each article.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white ">
                  References, Sources, and Citations
                </h2>

                <p>
                  We examine medical statements, claims, and suggestions with
                  the most current primary references, including peer-reviewed
                  medical journals, government organizations, educational
                  institutions, and advocacy associations. The sources are
                  listed inline and at the bottom of each article.
                </p>

                <p>
                  (ShedBody favors human research and proven therapies, although
                  relevant animal research and experimental / alternative
                  treatments may be reported if all of this is available to
                  promote understanding of a topic.)
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Latest information
                </h2>

                <p>
                  Time changes, and so does information. With the help of our
                  content experts, our editorial team regularly evaluates our
                  existing content every few months to ensure that all
                  information is up-to-date and reflects the most current
                  research, guidelines, and statistics are.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  The ShedBody voice
                </h2>

                <p>
                  We pride ourselves on being part of the revolution that is
                  truly changing what it means to be &quot;fit&quot;, and we
                  make sure that we use it in all of our content. The
                  information, advice, and lots of words we use are rooted in a
                  single goal: to help you learn how to live a happier,
                  healthier life that is free from dietary culture and that is
                  from the phobic trend Is free. And we provide a space that
                  cuts through all the complexities, confusions, and unrealistic
                  expectations that have been created by today&apos;s media.
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
