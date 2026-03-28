import Link from "next/link";

export const metadata = {
  title: "GDPR Privacy Policy",
  description:
    "This GDPR Privacy Policy document contains types of information that is collected and recorded by ShedBody and how we use it.",

  keywords: [
    "GDPR Privacy Policy",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/gdpr-privacy-policy",
  },
};

export default function GDPRPrivacyPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "GDPRPrivacyPolicyPage",
    name: "GDPR Privacy Policy",
    url: "https://shedbody.com/gdpr-privacy-policy",
    description:
      "This GDPR Privacy Policy document contains types of information that is collected and recorded by ShedBody and how we use it.",
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
              {/* Article Header */}
              <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  GDPR Privacy Policy
                </h1>
                <p className="max-w-2xl mx-auto text-lg">
                  This GDPR Privacy Policy document contains types of
                  information that is collected and recorded by ShedBody and how
                  we use it.
                </p>
              </header>

              {/* Content Sections */}
              <div className="space-y-4">
                <p>
                  At ShedBody, accessible from{" "}
                  <Link
                    href="/"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                  >
                    https://www.shedbody.com
                  </Link>
                  , one of our main priorities is the privacy of our visitors.
                </p>

                <p>
                  If you&apos;ve got additional questions or require more
                  information about our Privacy Policy, don&apos;t hesitate to{" "}
                  <Link
                    href="/contact-us"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                  >
                    contact us
                  </Link>
                  .
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  General Data Protection Regulation (GDPR)
                </h2>

                <p>We are a Data Controller of your information/data.</p>

                <p>
                  ShedBody legal basis for collecting and using the personal
                  information described in this Privacy Policy depends on the
                  Personal Information we collect and the specific context in
                  which we collect the information:
                </p>

                <ul className="space-y-2 list-disc list-inside marker:text-green-400">
                  <li>ShedBody needs to perform a contract with you</li>
                  <li>You have given ShedBody permission to do so</li>
                  <li>
                    Processing your personal information is in ShedBody
                    legitimate interests
                  </li>
                  <li>ShedBody needs to comply with the law</li>
                </ul>

                <p>
                  ShedBody will retain your personal information only for as
                  long as is necessary for the purposes set out in this Privacy
                  Policy. We&apos;ll retain and use your information to the
                  extent necessary to accommodates our legal obligations,
                  resolve disputes, and enforce our policies.
                </p>

                <p>
                  If you&apos;re a resident of the european Economic Area (EEA),
                  you&apos;ve got certain data protection rights. If you want to
                  be told what Personal Information we hold about you and if you
                  wish it to be removed from our systems, please contact us.
                </p>

                <p>
                  In certain circumstances, you have the following data
                  protection rights:
                </p>

                <ul className="space-y-2 list-disc list-inside marker:text-green-400">
                  <li>
                    The right to access, update or to delete the information we
                    have on you.
                  </li>
                  <li>The right of rectification.</li>
                  <li>The right to object.</li>
                  <li>The right of restriction.</li>
                  <li>The right to data portability.</li>
                  <li>The right to withdraw consent.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">Log Files</h2>

                <p>
                  ShedBody follows a standard procedure of using log files.
                  These log files visitors once they visit websites. All hosting
                  companies do that and a part/section of hosting services&apos;
                  analytics. The data/information collected by log files include
                  internet protocol (IP) addresses, browser type, Internet
                  Service Provider (ISP), date and time stamp, referring/exit
                  pages, and possibly the time/number of clicks. These
                  aren&apos;t linked to any information that&apos;s personally
                  identifiable. The aim/purpose of the data/information is for
                  analyzing trends, administering the site, tracking users&apos;
                  movement on the web site, and gathering demographic
                  information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Cookies and Web Beacons
                </h2>

                <p>
                  Like any other website, ShedBody uses &apos;cookies&apos;.
                  These cookies are accustomed store information including
                  visitors&apos; preferences, and also the pages on the website
                  that the visitor accessed or visited. The data/information is
                  used to optimize the users&apos; experience by customizing our
                  web page content supported visitors&apos; browser type and/or
                  other information.
                </p>

                <p>
                  For more general information on cookies, please read &quot;
                  <a
                    href="https://www.cookieconsent.com/what-are-cookies/"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                    target="_black"
                  >
                    What Are Cookies
                  </a>
                  &quot;.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Google DoubleClick DART Cookie
                </h2>

                <p>
                  Google is one of a third-party vendor on our website. It also
                  uses cookies, called DART cookies, to serve ads to our site
                  visitors based upon their visit to{" "}
                  <Link
                    href="/"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                  >
                    www.shedbody.com
                  </Link>{" "}
                  and other sites on the web/internet. However, visitors may opt
                  to decline the utilization of DART cookies by visiting the
                  Google ad and content network Privacy Policy at given URL –
                  <a
                    href="https://policies.google.com/technologies/ads"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                    target="_black"
                  >
                    https://policies.google.com/technologies/ads
                  </a>
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Our Advertising Partners
                </h2>

                <p>
                  Some of advertisers on our website can use cookies and web
                  beacons. Our advertising partners are listed below. Each of
                  our advertising partners has their own Privacy Policy for his
                  or her policies on user data/information. For easier access,
                  below we hyperlinked to their Privacy Policies.
                </p>

                <ul className="space-y-2 list-disc list-inside marker:text-green-400">
                  <li>
                    Google:{" "}
                    <a
                      href="https://policies.google.com/technologies/ads"
                      className="text-green-400 no-underline hover:text-green-300 transition"
                      target="_black"
                    >
                      https://policies.google.com/technologies/ads
                    </a>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Privacy Policies
                </h2>

                <p>
                  You may consult this list to find the Privacy Policy for each
                  of the advertising partners of ShedBody.
                </p>

                <p>
                  Third-party ad servers or ad networks uses technologies like
                  cookies, JavaScript, or Web Beacons that are used in their
                  respective advertisements and links that appear on ShedBody,
                  which are sent directly to users&apos; browser. They
                  automatically receive your IP address when this
                  occurs/happens. These technologies are accustomed measure the
                  effectiveness of their advertising campaigns and/or to
                  personalize the advertising content that you just see on
                  websites that you visit.
                </p>

                <p>
                  Note that ShedBody has no access to or control over these
                  cookies that are used by third-party advertisers.{" "}
                  <Link
                    href="/advertising-policy"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                  >
                    Read here our ad & sponsor policy
                  </Link>
                  .
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Third Party Privacy Policies
                </h2>

                <p>
                  ShedBody&apos;s Privacy Policy does not apply to other
                  advertisers or websites. Thus, we are advising you to consult
                  the respective Privacy Policies of those third-party ad
                  servers for more detailed information. It&apos;s going to
                  include their practices and instructions about how to (way to)
                  opt-out of certain options.
                </p>

                <p>
                  You can opt to disable cookies through your individual browser
                  options. To know/understand more detailed information about
                  cookie management with specific web browsers, it may be found
                  at the browsers&apos; respective websites.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Children&apos;s Information
                </h2>

                <p>
                  Another a part of our priority is adding protection for
                  children/kids/youngsters while using the internet. We
                  encourage parents and guardians to watch/observe, participate
                  in, and/or monitor and guide their online activity.
                </p>

                <p>
                  ShedBody does not knowingly collect any Personal Identifiable
                  Information from children under the age of 13. If you think
                  that your child provided this type of information/data on our
                  website, we strongly encourage you to contact us immediately
                  which we&apos;ll do our greatest efforts to promptly remove
                  such information from our records.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Online Privacy Policy Only
                </h2>

                <p>
                  Our Privacy Policy created at GDPRPrivacyPolicy.net applies
                  only to our online activities and is valid for visitors to our
                  website with regards to the data that they shared and/or
                  collect in ShedBody. This policy isn&apos;t applicable to any
                  information collected offline or via channels aside from this
                  website.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">Consent</h2>

                <p>
                  By using our website, you hereby consent to{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                  >
                    our Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/terms-of-use"
                    className="text-green-400 no-underline hover:text-green-300 transition"
                  >
                    agree to its terms
                  </Link>
                  .
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
