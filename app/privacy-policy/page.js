import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "This privacy policy explains: The types of information collected by ShedBody and its partners through the Services and the purposes for which We use it.",

  keywords: [
    "Privacy Policy",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicyPage",
    name: "Privacy Policy",
    url: "https://shedbody.com/privacy-policy",
    description:
      "This privacy policy explains: The types of information collected by ShedBody and its partners through the Services and the purposes for which We use it.",
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
              {/* ARTICLE HEADER */}
              <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Privacy Policy
                </h1>

                <p className="max-w-2xl mx-auto text-lg">
                  Our website address is:{" "}
                  <Link
                    href="/"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    https://www.shedbody.com
                  </Link>
                  .
                </p>
              </header>

              <div className="space-y-4">
                <p>
                  <strong>
                    This privacy policy (“Privacy Policy”) explains:
                  </strong>
                </p>

                <p>
                  The types of information collected by ShedBody and its
                  partners through the Services and the purposes for which We
                  use it. How ShedBody collects, stores, and shares your
                  information. Your rights with respect to such information
                  collection.
                </p>

                <p>
                  Your access to and use of the Services is subject to
                  ShedBody’s Terms of Use (the “Terms”). Any capitalized term
                  used, but not defined, means given in the terms in this
                  Privacy Policy.
                </p>

                <p>
                  BY USING, REGISTERING TO, OR OTHERWISE ACCESSING ANY SERVICES,
                  YOU AGREE TO SHEDBODY PRIVACY POLICY AND CONSENT TO THE
                  COLLECTION, USE, AND PROCESSING OF YOUR PERSONAL DATA IN
                  ACCORDANCE WITH SHEDBODY PRIVACY POLICY. IF YOU DON’T AGREE TO
                  THIS PRIVACY POLICY, PLEASE DO NOT VISIT, USE, REGISTER TO, OR
                  OTHERWISE ACCESS ANY SERVICES.
                </p>

                <p>
                  <strong>Personal Information:</strong> “Personal Information”
                  is information/data that can be used either directly or
                  indirectly to identify an individual (you). Examples include
                  name, email address, physical address, Internet protocol (IP)
                  address, mobile ad ID, and your interactions with the Websites
                  that are connected to other identifying information, such as
                  name, email address, physical address, and Internet protocol
                  IP address.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  What personal data we collect and why we collect it?
                </h2>

                <h3 className="text-xl font-semibold text-white">Comments</h3>

                <p>
                  When visitors leave comments on our website we collect the
                  data/information shown in the comments form, and also the
                  visitor’s IP address and browser user agent string to
                  help/assist spam detection.
                </p>

                <h3 className="text-xl font-semibold text-white">Media</h3>

                <p>
                  If you upload images to our website, you must avoid uploading
                  images with embedded location data (EXIF GPS) included.
                  Visitors to the website can download and extract any location
                  data from images on our website.
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Cookies and Web Beacons
                </h3>

                <p>
                  Like any other website, ShedBody uses ‘
                  <Link
                    href="/cookies-policy"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    cookies
                  </Link>
                  ’. These cookies are used to store information/data including
                  visitors’ preferences, and the pages on the website that the
                  visitor accessed or visited. The information/data is used to
                  optimize the users’ experience by customizing our web page
                  content based on visitors’ browser type and/or other
                  information/data.
                </p>

                <p>
                  If you leave a comment on our site you may opt-in/choose to
                  saving your name, your email address and your website in
                  cookies. These are for your convenience so that you don&apos;t
                  have to fill in your details again when you leave another
                  comment. These cookies will last for one year.
                </p>

                <p>
                  If you visit our login page, we&apos;ll set a temporary cookie
                  to see if your browser accepts cookies. This cookie contains
                  no personal data/information and is discarded once you close
                  your browser.
                </p>

                <p>
                  When you log in, we&apos;ll also originated several cookies to
                  save your login information and your screen display choices.
                  Login/signin cookies last for 2 days, and screen options
                  cookies last for one year. If you choose/opt-in “Remember Me”,
                  your login will persist for 2 weeks. If you sing/log out of
                  your account, the login cookies are going to be removed.
                </p>

                <p>
                  If you edit or publish an article/editorial, an additional
                  cookie are going to be saved in your browser. This cookie
                  includes no personal data/information and easily indicates the
                  post ID of your article you only edited. It expires after 1
                  day.
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Google DoubleClick DART Cookie
                </h3>

                <p>
                  Google is one of a third-party vendor on our website. It also
                  uses cookies, called DART cookies, to serve ads to our website
                  visitors based upon their visit to{" "}
                  <Link
                    href="/"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    www.shedbody.com
                  </Link>{" "}
                  and other websites on the web/internet. However, visitors may
                  choose/opt to decline the use of DART cookies by visiting the
                  Google ad and content network Privacy Policy at given URL –
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    https://policies.google.com/technologies/ads
                  </a>
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Our Advertising Partners
                </h3>

                <p>
                  Some of our advertisers on the website can use cookies and web
                  beacons. Below our advertising partners are listed. Each of
                  our advertising partners has their own Privacy Policy for
                  their policies on user data/information. For easier access,
                  below we hyperlinked to their Privacy Policies.
                </p>

                <ul className="space-y-2 list-disc list-inside marker:text-green-400">
                  <li>Google</li>
                  <li>
                    <a
                      href="https://policies.google.com/technologies/ads"
                      target="_blank"
                      className="no-underline text-green-400 hover:text-green-300 transition"
                    >
                      https://policies.google.com/technologies/ads
                    </a>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white">
                  Privacy Policies
                </h3>

                <p>
                  You may consult this list to find the Privacy Policy for each
                  of the advertising partners of ShedBody.
                </p>

                <p>
                  Third-party ad servers or ad networks uses technologies like
                  cookies, JavaScript, or Web Beacons that are used in their
                  respective advertisements and links that appear on ShedBody,
                  which are sent directly to users’ browser. They automatically
                  receive your IP address when this occurs/happens. These
                  technologies are accustomed measure the effectiveness of their
                  advertising campaigns and/or to personalize the advertising
                  content that you just see on websites that you visit.
                </p>

                <p>
                  Note that ShedBody has no access to or control over these
                  cookies that are used by third-party advertisers.
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Third-Party Privacy Policies
                </h3>

                <p>
                  ShedBody’s Privacy Policy does not apply to other advertisers
                  or websites. Thus, we are advising you to consult the
                  respective Privacy Policies of those third-party ad servers
                  for more detailed information. It’s going to include their
                  practices and instructions about how to (way to) opt-out of
                  certain options. You may find a complete list of these Privacy
                  Policies and their links: on visiting their site.
                </p>

                <p>
                  You can choose/opt to disable cookies through your individual
                  browser options. To know more detailed information about
                  cookie management with specific web browsers, which can be
                  found at the browsers’ respective websites.{" "}
                  <Link
                    href="/cookies-policy"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    What Are Cookies
                  </Link>
                  ?
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Children’s Information
                </h3>

                <p>
                  Another part of our priority is adding protection for
                  children/kids/youngsters while using the internet. We
                  encourage parents and guardians to observe/watch, participate
                  in, and/or monitor and guide their online activity.
                </p>

                <p>
                  ShedBody does not knowingly collect any Personal Identifiable
                  Information from children/kids/youngsters under the age of 13.
                  If you think that your child /kids/youngsters provided this
                  kind of information/data on our website, we strongly encourage
                  you to contact us immediately and we will do our best efforts
                  to promptly remove such information/data from our records.
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Online Privacy Policy Only
                </h3>

                <p>
                  This Privacy Policy applies only to our online activities and
                  is valid for visitors to our website with regards to the
                  data/information that they shared and/or collect in ShedBody.
                  This policy isn&apos;t applicable to any information collected
                  offline or via channels aside from this website.
                </p>

                <h3 className="text-xl font-semibold text-white">
                  Embedded content from other websites
                </h3>

                <p>
                  Articles on our website may include embedded content (for
                  example videos, images, articles, etc.). Embedded content from
                  other websites behaves within the very same way as if the
                  visitor has visited the other website.
                </p>

                <p>
                  These websites may collect data about you, use cookies, embed
                  additional third-party tracking, and monitor your interaction
                  therewith embedded content, including tracking your
                  interaction with the embedded content if you&apos;ve got an
                  account and are logged in thereto website.
                </p>

                <h4 className="text-lg font-semibold text-white">
                  Supporting Information
                </h4>

                <p>
                  Please note: The publisher is not responsible for the content
                  or functionality of any supporting information provided by the
                  authors. Any questions (other than missing material or
                  content) should be directed to the respective author for the
                  article.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  How long we retain your data
                </h2>

                <p>
                  If you leave a comment, the comment and its metadata may
                  retained indefinitely. This is so we are able to recognize and
                  approve any follow-up comments automatically rather than
                  holding them during a moderation queue.
                </p>

                <p>
                  For users that register on our website (if any), we also store
                  the private data/information they provide in their user
                  profile. All users can see, edit, or delete their personal
                  information at any time (except they can&apos;t change their
                  username). Website administrators also can see/observe and
                  edit that information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  What rights you have over your data
                </h2>

                <p>
                  If you&apos;ve got an account on this site or have left
                  comments, you&apos;ll be able to request to receive an
                  exported file of the private data we hold about you, including
                  any data you&apos;ve got provided to us. you&apos;ll be able
                  to also request that we erase any personal data we hold about
                  you. This doesn&apos;t include any data we are obliged to stay
                  for administrative, legal, or security purposes.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Where we send your data
                </h2>

                <p>
                  Visitor comments can be checked through our automated spam
                  detection service.
                </p>

                <h3 className="text-xl font-semibold text-white">Consent</h3>

                <p>
                  By using our website, you hereby consent to ShedBody Privacy
                  Policy and agree to its{" "}
                  <Link
                    href="/terms-of-use"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    Terms and Conditions
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
