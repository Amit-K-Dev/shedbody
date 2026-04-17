import Link from "next/link";

export const metadata = {
  title: "Privacy Settings",
  description:
    "This privacy settings page explains why we collect data on our site, who has access to it and why we are asking you to allow us to do so.",

  keywords: [
    "Privacy Settings",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/privacy-settings",
  },
};

export default function PrivacySettingsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "PrivacySettingsPage",
    name: "Privacy Settings",
    url: "https://shedbody.com/privacy-settings",
    description:
      "This privacy settings page explains why we collect data on our site, who has access to it and why we are asking you to allow us to do so.",
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

      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <article className="max-w-2xl mx-auto space-y-8 text-gray-300 leading-relaxed">
            {/* ARTICLE HEADER */}
            <header className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-50">
                Privacy Settings
              </h1>

              <p className="max-w-2xl mx-auto text-lg">
                This privacy settings page explains why we collect data on our
                site, who has access to it and why we are asking you to allow us
                to do so.
              </p>
            </header>

            <div className="space-y-4">
              <p>
                We believe that health and fitness information should be free to
                all, and we rely on advertising to make it possible. Providing
                the best health and fitness information in the world is
                expensive. We spend up to thousands of dollars per article to
                ensure that it is accurate and accurate with quality reviews by
                the certified, trained professionals.
              </p>

              <p>
                When you visit our websites (
                <Link
                  href="/"
                  className="no-underline text-emerald-400 hover:text-emerald-300 transition"
                >
                  ShedBody
                </Link>
                ), we improve your browsing experience, store or access relevant
                information, optimize content and offers, personalize
                advertising, analyze our traffic Use cookies and similar
                tracking technologies to do and understand you better. If you
                don't allow "ad selection, distribution, and reporting", you'll
                still see ads, but the ads may be less relevant and interesting
                to you.
              </p>

              <p>
                You can change your mind about your privacy options at any time
                and return to this page and revisit your privacy settings. To do
                this, click "Privacy Settings" in the footer or change the
                cookie settings in your browser. Read more about our{" "}
                <Link
                  href="/privacy-policy/"
                  className="no-underline text-emerald-400 hover:text-emerald-300 transition"
                >
                  privacy policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/advertising-policy/"
                  className="no-underline text-emerald-400 hover:text-emerald-300 transition"
                >
                  advertising policy
                </Link>
                .
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">
                How we use your data
              </h2>

              <hr className="h-px my-8 bg-zinc-400 border-0" />

              <h3 className="text-xl font-semibold text-zinc-50">
                Information storage and access
              </h3>

              <p>
                Use of information already stored on your device, or in the form
                of advertising identifiers, device identifiers, cookies, and
                similar technologies.
              </p>

              <hr className="h-px my-8 bg-zinc-400 border-0" />

              <h3 className="text-xl font-semibold text-zinc-50">
                Privatization
              </h3>

              <p>
                The collection and processing of information about your use of
                this service subsequently personalizes content for you in
                advertising and / or other contexts, such as over other websites
                or apps, over time. Typically, the content of a site or
                application is used to make assumptions about your interests,
                which inform future advertising and/or content selection.
              </p>

              <hr className="h-px my-8 bg-zinc-400 border-0" />

              <h3 className="text-xl font-semibold text-zinc-50">
                Ad Selection, Delivery, Reporting
              </h3>

              <p>
                Collection of information, and combination with information
                already collected, to select and distribute advertisements for
                you, and to measure the delivery and effectiveness of such
                advertisements. This includes using pre-collected information
                about your interests to select ads, processing data about when
                ads are displayed, how often they are shown, when and where they
                were shown, and whether you have taken any action related to the
                advertisement for, for example one click advertising or
                shopping. This does not include personalization, which is the
                collection and processing of information about your use of this
                service, which subsequently personalizes advertising and/or
                content for you in other contexts, such as a website or app,
                over time.
              </p>

              <hr className="h-px my-8 bg-zinc-400 border-0" />

              <h3 className="text-xl font-semibold text-zinc-50">
                Material Selection, Distribution, Reporting
              </h3>

              <p>
                Collection of information for you to select and distribute
                content and to measure the delivery and effectiveness of such
                content, and in conjunction with the information already
                collected. This includes using previously collected information
                about your interests to select content, what content was shown
                to the data, how often or how often it was shown, when and where
                it was shown, and whether you performed an action related to the
                content, including for example clicking on the content. This
                does not include personalization, which is the collection and
                processing of information about your use of this service that,
                over time, personalizes content and/or advertising for you in
                other contexts, such as a website or app.
              </p>

              <hr className="h-px my-8 bg-zinc-400 border-0" />

              <h3 className="text-xl font-semibold text-zinc-50">
                Measurement
              </h3>

              <p>
                Collection of information about your use of the content, and in
                conjunction with the information already collected, used,
                understood and reported on your use of the service. This does
                not include personalization, the collection of information about
                your use of this service subsequently personalizes advertising
                for you in content and/or other contexts, namely over other
                services over time, such as a website or app.
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
