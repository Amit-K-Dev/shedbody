import Link from "next/link";

export const metadata = {
  title: "Primary Workplace Policy",
  description:
    "Our primary workplace policy encompasses a range of initiatives and practices aimed at creating a positive, supportive, and welcoming atmosphere for all employees.",

  keywords: [
    "Primary Workplace Policy",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/primary-workplace-policy",
  },
};

export default function PrimaryWorkplacePolicy() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "PrimaryWorkplacePolicy",
    name: "Primary Workplace Policy",
    url: "https://shedbody.com/primary-workplace-policy",
    description:
      "Our primary workplace policy encompasses a range of initiatives and practices aimed at creating a positive, supportive, and welcoming atmosphere for all employees.",
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
                Primary Workplace Policy
              </h1>

              <p className="max-w-2xl mx-auto text-lg">
                At{" "}
                <Link
                  href="/"
                  className="no-underline text-emerald-400 hover:text-emerald-300 transition"
                >
                  ShedBody
                </Link>
                , we are dedicated to fostering a workplace environment that
                promotes diversity, equity, inclusion, and belonging. Our
                primary workplace policy encompasses a range of initiatives and
                practices aimed at creating a positive, supportive, and
                welcoming atmosphere for all employees.
              </p>
            </header>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">
                Equal Opportunities
              </h2>

              <p>
                We believe in providing equal opportunities for all employees,
                irrespective of their background, identity, or personal
                characteristics. Our hiring process is fair, transparent, and
                merit-based, ensuring that all candidates are evaluated based on
                their qualifications, skills, and potential contributions to the
                organization. We are committed to creating a diverse workforce
                that reflects the communities we serve and promotes innovation
                and creativity.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Work-Life Balance
              </h2>

              <p>
                We recognize the importance of work-life balance in maintaining
                employee well-being and productivity. Our workplace policy
                encourages flexible work arrangements, including remote work
                options, flexible hours, and compressed workweeks, to
                accommodate the diverse needs of our employees. We also provide
                generous paid time off, including vacation days, sick leave, and
                company holidays, to allow employees to recharge, relax, and
                spend time with their families and loved ones.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Health and Wellness
              </h2>

              <p>
                Employee health and wellness are top priorities at ShedBody. We
                offer comprehensive health benefits, including medical, dental,
                and vision coverage, to support employees' physical well-being.
                Additionally, we provide wellness programs and resources to
                promote mental and emotional health, such as fitness facilities,
                wellness workshops, mindfulness programs, and employee
                assistance programs. Our goal is to create a culture of
                well-being where employees feel supported in prioritizing their
                health and happiness.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Professional Development
              </h2>

              <p>
                We are committed to investing in the professional growth and
                development of our employees. Our workplace policy includes
                opportunities for training, skill development, and career
                advancement, such as workshops, seminars, conferences, and
                tuition reimbursement programs. We encourage employees to pursue
                continuous learning and growth, both personally and
                professionally, to enhance their skills, knowledge, and
                capabilities.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Inclusivity and Respect
              </h2>

              <p>
                At ShedBody, we value diversity, inclusivity, and respect in all
                aspects of our workplace. We foster a culture of open
                communication, collaboration, and mutual respect, where all
                employees feel heard, valued, and empowered to contribute their
                unique perspectives and ideas. We have zero tolerance for
                discrimination, harassment, or any form of disrespectful
                behavior, and we provide channels for employees to report
                concerns and seek support in a safe and confidential manner.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Environmental Sustainability
              </h2>

              <p>
                We are committed to minimizing our environmental footprint and
                promoting sustainability in the workplace. Our workplace policy
                includes initiatives to reduce waste, conserve energy, and
                protect natural resources, such as recycling programs,
                energy-efficient practices, and eco-friendly policies. We strive
                to create an environmentally responsible workplace that
                contributes to a healthier planet for future generations.
              </p>

              <p>
                By upholding these workplace policies, we aim to create a
                positive and inclusive work environment where all employees can
                thrive, grow, and succeed. We believe that by embracing
                diversity, equity, and inclusion, and promoting employee
                well-being, we can foster a culture of innovation,
                collaboration, and excellence at ShedBody.
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
