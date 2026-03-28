import ExpertSection from "./ExpertSection";
import FAQSection from "./FAQSection";
import TrustSection from "./TrustSection";
import { experts } from "@/lib/experts";
import { faqs } from "./faqData";

export const metadata = {
  title: "Scientific Review Board",
  description:
    "Learn how ShedBody ensures accuracy through expert-reviewed, evidence-based content and scientific validation.",

  keywords: [
    "Scientific Review Board",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/scientific-review-board",
  },
};

export default function ScientificReviewBoardPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ScientificReviewBoardPage",
    name: "Scientific Review Board",
    url: "https://shedbody.com/scientific-review-board",
    description:
      "Learn how ShedBody ensures accuracy through expert-reviewed, evidence-based content and scientific validation.",
    isPartOf: {
      "@type": "WebSite",
      name: "ShedBody",
      url: "https://shedbody.com",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const personSchema = experts.map((expert) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: expert.name,
    jobTitle: expert.role,
    description: `${expert.degree}. ${expert.experience}. Specializes in ${expert.speciality}.`,
    affiliation: {
      "@type": "Organization",
      name: "ShedBody",
    },
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema, faqSchema, ...personSchema),
        }}
      />

      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <article className="mx-auto space-y-10 text-gray-300 leading-relaxed">
            {/* HERO */}
            <header className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Scientific Review Board
              </h1>

              <p className="text-lg text-gray-400 max-w-xl  mx-auto ">
                Ensuring every piece of content and recommendation on ShedBody
                is backed by science, reviewed by experts, and built for real
                results.
              </p>
            </header>

            {/* TRUSTED BADGE */}
            <TrustSection />

            {/* Expert Section */}
            <ExpertSection />

            {/* Content Sections */}
            <div className="space-y-4">
              <p>
                At ShedBody, we take the quality and accuracy of our products
                and information seriously. That&apos;s why we have established a
                Scientific Review Board, composed of experts in the field of
                sports nutrition, and dietitians, molecular biologists, doctors,
                and others in an objective to regularly review and evaluate our
                content and product offerings.
              </p>

              <p>
                Our articles are based on scientific evidence written by our
                team of licensed nutritionists and dietitians, molecular
                biologists, doctors, and others in an objective, unbiased,
                honest and striving to present both sides of the argument.
              </p>

              <p>
                They follow a detailed, rigorous, multistage process to create
                content that meets the highest standards of clarity,
                practicality, and scientific integrity.
              </p>

              <p>
                The Scientific Review Board meets on a regular basis to evaluate
                the accuracy of our information, review new research and
                studies, and advise on the development of new products. Our goal
                is to provide our customers with the most accurate and
                up-to-date information and the highest quality products
                available.
              </p>

              <p>
                If you have any questions or concerns about our products or
                information, please don&apos;t hesitate to contact us.
                We&apos;re here to help!
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                How the Scientific Review Board Works
              </h2>

              <p>
                The Scientific Review Board plays a crucial role in ensuring
                that all the information and products offered by ShedBody are of
                the highest quality. Here&apos;s how the board works:
              </p>

              <h3 className="text-xl font-semibold text-white">
                Reviewing Information
              </h3>

              <p>
                The Scientific Review Board regularly reviews all the
                information on the ShedBody website, including product
                descriptions, blog posts, and FAQs. They evaluate the accuracy
                of the information and ensure that it is consistent with current
                research and scientific evidence.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Advising on Product Development
              </h3>

              <p>
                ShedBody is committed to offering cutting-edge products to
                enhance athletic performance. The Scientific Review Board works
                closely with the product development team to provide expert
                advice and recommendations on the formulation and design of new
                products.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Staying Up-to-Date
              </h3>

              <p>
                The field of sports nutrition is constantly evolving, and new
                research is published regularly. The Scientific Review Board
                stays up-to-date on the latest research and advancements in the
                field to ensure that the information and products offered by
                ShedBody are current and relevant.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Benefits of the Scientific Review Board
              </h2>

              <p>
                The ShedBody Scientific Review Board offers numerous benefits to
                our customers:
              </p>

              <h3 className="text-xl font-semibold text-white">
                Expert Recommendations
              </h3>

              <p>
                By having a team of experts in sports nutrition and dietitians,
                molecular biologists, doctors, and others in an objective
                reviewing our products and information, ShedBody can provide our
                readers/customers with the most accurate and reliable
                recommendations.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Quality Assurance
              </h3>

              <p>
                The Scientific Review Board helps to ensure the quality of all
                our products and information, giving our readers/customers peace
                of mind that they are making informed decisions based on
                accurate information.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Cutting-Edge Products
              </h3>

              <p>
                By working with the Scientific Review Board, ShedBody can stay
                at the forefront of the sports nutrition and dietitians,
                molecular biologists, doctors, and others industry and offer the
                latest and most innovative products to enhance athletic
                performance.
              </p>

              <p>
                In conclusion, the ShedBody Scientific Review Board is an
                important part of our commitment to providing our customers with
                the best possible products and information. We are proud to have
                such a distinguished and knowledgeable team advising us, and we
                believe that it sets us apart in the sports nutrition and
                dietitians, molecular biologists, doctors, and others industry.
              </p>
            </section>

            {/* FAQs SECTION */}
            <FAQSection />
          </article>
        </div>
      </section>
    </>
  );
}
