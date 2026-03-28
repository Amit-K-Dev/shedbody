import Link from "next/link";

export const metadata = {
  title: "About ShedBody",
  description:
    "Learn about ShedBody's mission to simplify fitness, fat loss, and healthy living with practical workouts, nutrition guidance, and sustainable habits.",

  keywords: [
    "ShedBody",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "healthy lifestyle",
    "fitness transformation",
    "fitness tracking",
    "weight loss india",
  ],

  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About ShedBody",
    url: "https://shedbody.com/about",
    description:
      "Learn about ShedBody's mission to simplify fitness, fat loss, and healthy living with practical workouts, nutrition guidance, and sustainable habits.",
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

      <section className="max-w-4xl mx-auto px-6 py-20 text-gray-300">
        {/* HERO SECTION */}
        <section className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            About ShedBody
          </h1>
          <p className="max-w-2xl mx-auto text-lg">
            Helping you transform your body and build a sustainable lifestyle -
            without confusion or shortcuts.
          </p>
        </section>

        {/* Who We Are */}
        <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Who We Are
            </h2>
            <p className="leading-relaxed mb-6">
              ShedBody is built to simplify fitness. No overwhelming advice, no
              urealistic expectations - just clear, practical guidance that
              helps you stay consistent and get real results.
            </p>
            <p className="leading-relaxed mb-6">
              We covers all facets of Health, Fitness, Yoga (offers all
              practitioners—from beginners to masters—expert information on how
              to live a healthier, happier, more fulfilling life both on and
              in-depth reporting on poses, breathing, meditation), Beauty (Skin
              Care, Hair Care, Makeup, Hairstyles, and Fashion), nutrition,
              health, trends and more openly and objectively because we’re here
              for the whole person — for your whole life.
            </p>
          </div>
        </section>

        {/* MISSION */}
        <section className="bg-zinc-900 text-white py-16 px-6 text-center mb-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-center text-white mb-10">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              "Workout Guides",
              "Yoga Guides",
              "Nutrition Advice",
              "Progress Tracking",
              "Fitness Education",
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 border border-zinc-700 rounded-2xl hover:shadow-lg transition"
              >
                <h3 className="font-medium mb-2">{item}</h3>
                <p className="text-sm text-gray-400">
                  Practical and easy-to-follow guidance designed for real-life
                  consistency.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* APPROACH */}
        <section className="bg-zinc-900 py-16 px-6 rounded-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Our Approach
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-4">
              {[
                "No shortcuts",
                "No urealistic promises",
                "No unnecessary complexity",
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-zinc-800 rounded-2xl shadow-sm"
                >
                  <p className="font-medium">{item}</p>
                </div>
              ))}
            </div>

            <p className="mb-6">
              How you influence every single day of your life is why you work
              well and stay well. No matter your journey, ShedBody are here to
              support, guide and inspire you.
            </p>
            <p className="mb-6">
              Through ShedBody new approach and well-researched, informative and
              reliable content, ShedBody intend to inspire and equip readers
              around the world to live healthier and happier lives.
            </p>
            <p className="mb-6">
              ShedBody cut through the confusion with direct, expert-reviewed,
              person-first experiences – all designed to help you make the best
              decision for you and the people you love.
            </p>
          </div>
        </section>

        {/* Authors and Policies */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Our Authors and Policies
            </h2>

            <p className="mb-6">
              When it comes to your fitness and nutrition, there is no &quot;one
              size fits all&quot;. This is why you need a reliable voice to
              emphasize the facts on fads. ShedBody authors are a team of
              trusted dieticians, personal trainers, psychologists who give you
              a holistic approach to fitness, not perfection, with a focus on
              food, weight loss, physical, mental health, and perfection. Let us
              guide you through each step of your health and fitness journey
              towards your healthy goals as personal milestones.
            </p>
            <p className="mb-6">
              Writers are particularly chosen for both their extensive knowledge
              and real-world experience, as well as their ability to communicate
              complex information in a clear and helpful manner. Articles also
              undergo review by our experts, certified personal trainers,
              licensed dietitians, and more, as well as regularly updating to
              ensure reporting is responsible for the most accurate research Is
              accurate, understandable, helpful and reflective.
            </p>
          </div>
        </section>

        {/* Review and Product Testing */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Our Review and Product Testing
            </h2>

            <p className="mb-6">
              Our news articles are based on the latest information available,
              and are supported with data and expert input to provide a detailed
              and up-to-date picture of fitness and nutrition news.
            </p>
            <p className="mb-6">
              ShedBody product reviews are independent and based on research and
              product testing. If you visit the link to our content, we can
              receive a commission from your purchase.{" "}
              <Link
                href="/product-selection"
                className="text-green-400 hover:text-green-300"
              >
                Learn more about our review process
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Follow Us */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Follow Us on Social Media
            </h2>

            <p className="mb-6">
              We believes in the power of exchange of ideas to create a
              community. As your colleague, we promise to never leave you
              trapped in our journey for your good. We are committed to bringing
              all health and fitness matters to the spotlight. Through moderated
              conversations, expert-placed videos, and content serving the whole
              person, ShedBody is changing the way we think about wellbeing. To
              start a conversation and get the latest updates.
            </p>
            <p className="mb-4 font-semibold">Follow Us:</p>
            <ul className="flex gap-3 mb-2">
              <li>
                <a
                  href="https://www.facebook.com/shedbody/"
                  className="no-underline bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-400 text-gray-400 hover:text-green-400 transition p-2"
                  target="_blank"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/shedbody_/"
                  className="no-underline bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-400 text-gray-400 hover:text-green-400 transition p-2"
                  target="_blank"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/shedbody/"
                  className="no-underline bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-400 text-gray-400 hover:text-green-400 transition p-2"
                  target="_blank"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.pinterest.com/shedbody/"
                  className="no-underline bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-400 text-gray-400 hover:text-green-400 transition p-2"
                  target="_blank"
                >
                  Pinterest
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@shed-body"
                  className="no-underline bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-400 text-gray-400 hover:text-green-400 transition p-2"
                  target="_blank"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/shedbody"
                  className="no-underline bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-400 text-gray-400 hover:text-green-400 transition p-2"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 px-6">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Start Your Transformation Today
          </h2>

          <p className="mb-6">
            Progress starts with one step. Stay consistent, and results will
            follow.
          </p>
          <Link
            href="/workouts"
            className="inline-block bg-green-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-green-300 transition"
          >
            Explore Workouts
          </Link>
        </section>
      </section>
    </>
  );
}
