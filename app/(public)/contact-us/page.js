import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact for Fitness, Diet & Workout Support",
  description:
    "Get in touch with ShedBody for personalized fitness guidance, fat loss strategies, workout plans, yoga, and nutrition support. Start your transformation today.",

  keywords: [
    "contact shedbody",
    "fitness support india",
    "fat loss consultation india",
    "workout plan help",
    "diet plan support",
    "yoga guidance india",
    "online fitness coaching india",
    "weight loss help india",
    "shed body contact",
  ],

  alternates: {
    canonical: "https://shedbody.com/contact-us",
  },

  openGraph: {
    title: "Contact for Start Your Fitness Journey",
    description:
      "Need help with fat loss, workout plans, or diet? Contact ShedBody and get expert guidance.",
    url: "https://shedbody.com/contact-us",
    siteName: "ShedBody",
    type: "website",
  },
};

export default function ContactUs() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact ShedBody",
    url: "https://shedbody.com/contact-us",
    description:
      "Contact ShedBody for fitness guidance, fat loss strategies, workout routines, yoga, and nutrition advice.",
    mainEntity: {
      "@type": "Organization",
      name: "ShedBody",
      url: "https://shedbody.com",
      sameAs: [
        "https://youtube.com/@shed-body",
        "https://linkedin.com/company/shedbody",
        "https://facebook.com/shedbody",
        "https://instagram.com/shedbody_",
        "https://pinterest.com/shedbody",
        "https://twitter.com/shedbody",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
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
          <article className="max-w-2xl mx-auto space-y-10 text-gray-300 leading-relaxed">
            {/* HEADER */}
            <header className="text-center space-y-5">
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-50">
                Contact ShedBody
              </h1>

              <p className="text-lg max-w-2xl mx-auto">
                Need help with your fitness journey? Whether you're trying to
                lose fat, build muscle, or stay consistent — the{" "}
                <Link
                  href="/"
                  className="no-underline text-emerald-400 hover:text-emerald-300 transition"
                >
                  ShedBody
                </Link>{" "}
                team is here to guide you.
              </p>
            </header>

            {/* WHY CONTACT */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">
                How We Can Help You
              </h2>

              <p>
                We provide practical and science-backed fitness solutions
                designed for real people. You can reach out for:
              </p>

              <ul className="list-disc list-outside pl-6 space-y-2 marker:text-emerald-500">
                <li>Fat loss and weight management strategies</li>
                <li>Customized workout plans (home & gym)</li>
                <li>Diet and nutrition guidance (Indian-friendly)</li>
                <li>Yoga and flexibility routines</li>
                <li>General fitness queries and support</li>
              </ul>
            </section>

            {/* RESPONSE TIME */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">
                Response Time
              </h2>

              <p>
                We usually respond within <strong>24–48 hours</strong>. For
                faster answers, explore our{" "}
                <Link
                  href="/articles"
                  className="text-emerald-400 hover:text-emerald-300 transition"
                >
                  fitness articles
                </Link>{" "}
                where we cover most common questions.
              </p>
            </section>

            <section className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-zinc-50 text-center">
                Send Us a Message
              </h2>

              <ContactForm />
            </section>

            {/* CTA */}
            <section className="space-y-4 text-center">
              <h2 className="text-2xl font-semibold text-zinc-50">
                Start Your Transformation
              </h2>

              <p>
                Your fitness journey doesn’t need to be confusing. Reach out and
                take your first step toward a healthier, stronger body.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-zinc-50">
                Explore More
              </h3>

              <ul className="space-y-2">
                <li>
                  <Link
                    href="/start"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Start New Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workouts"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Workout Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/nutrition"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Nutrition Advice
                  </Link>
                </li>
              </ul>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
