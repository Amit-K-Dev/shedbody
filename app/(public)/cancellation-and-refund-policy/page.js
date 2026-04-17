import Link from "next/link";

export const metadata = {
  title: "Cancellation and Refund Policy",
  description:
    "At ShedBody, we want you to be fully satisfied with every product/service you purchase from us.",

  keywords: [
    "Cancellation and Refund Policy",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/cancellation-and-refund-policy",
  },
};

export default function CancellationAndRefundPolicy() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CancellationAndRefundPolicy",
    name: "Cancellation and Refund Policy",
    url: "https://shedbody.com/cancellation-and-refund-policy",
    description:
      "At ShedBody, we want you to be fully satisfied with every product/service you purchase from us.",
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
                Cancellation and Refund Policy
              </h1>

              <p className="max-w-2xl mx-auto text-lg">
                At{" "}
                <Link
                  href="/"
                  className="no-underline text-emerald-400 hover:text-emerald-300 transition"
                >
                  ShedBody
                </Link>
                , we want you to be fully satisfied with every product/service
                you purchase from us. However, if for any reason, you are not
                satisfied with your purchase, we offer a hassle-free
                cancellation and refund policy. Please read the following
                information carefully to understand our policies.
              </p>
            </header>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">
                Returns and Exchanges
              </h2>

              <p>
                You may return or exchange any product/service within 30 days of
                the purchase date. The product/service must be unused, in its
                original packaging and in a resalable condition. If 30 days have
                gone by since your purchase, unfortunately, we can not offer you
                a refund or exchange.
              </p>

              <p>
                To initiate a return or exchange, please contact our customer
                service team at{" "}
                <a
                  href="mailto:returns@shedbody.com"
                  data-type="mailto"
                  data-id="mailto:returns@shedbody.com"
                >
                  returns@shedbody.com
                </a>{" "}
                with your order number and details about the product/service you
                would like to return or exchange. Our team will respond within
                24-48 hours with instructions on how to proceed with the return
                or exchange process.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">Refunds</h2>

              <p>
                Once we receive your returned product/service, our team will
                inspect it and notify you of the status of your refund. If your
                refund is approved, it will be processed, and a credit will
                automatically be applied to your original method of payment
                within 7-10 business days.
              </p>

              <p>
                In case of an exchange, if the product/service is of higher
                value than the original, you will be required to pay the
                difference in price. If the product/service is of lower value,
                we will issue a refund for the difference.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Refund Processing Time
              </h2>

              <p>
                Please allow 7-10 business days for your refund to be processed
                after we receive your return request. If you have not received
                your refund after 10 business days, please contact us at{" "}
                <a
                  href="mailto:returns@shedbody.com"
                  data-type="mailto"
                  data-id="mailto:returns@shedbody.com"
                >
                  returns@shedbody.com
                </a>
                , and we will investigate the issue.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Shipping Costs
              </h2>

              <p>
                Shipping costs for returning or exchanging a product/service are
                the responsibility of the customer, unless the product/service
                is faulty or damaged.
              </p>

              <h2 className="text-2xl font-semibold text-zinc-50">
                Contact Us
              </h2>

              <p>
                If you have any questions about our cancellation and refund
                policy, please contact us at{" "}
                <a
                  href="mailto:returns@shedbody.com"
                  data-type="mailto"
                  data-id="mailto:returns@shedbody.com"
                >
                  returns@shedbody.com
                </a>
                , and we will be happy to assist you.
              </p>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
