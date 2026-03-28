import Link from "next/link";

export const metadata = {
  title: "Cookies Policy",
  description:
    "This Cookies Policy explains what information they collect, how we use it and why we sometimes need to store these cookies.",

  keywords: [
    "Cookies Policy",
    "fitness platform",
    "fat loss journey",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/cookies-policy",
  },
};

export default function CookiesPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CookiesPolicyPage",
    name: "Cookies Policy",
    url: "https://shedbody.com/cookies-policy",
    description:
      "This Cookies Policy explains what information they collect, how we use it and why we sometimes need to store these cookies.",
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
                  Cookies Policy
                </h1>
                <p className="max-w-2xl mx-auto text-lg">
                  Last updated: March 26, 2026
                </p>
                <p className="max-w-2xl mx-auto text-lg">
                  Cookies Policy of{" "}
                  <Link
                    href="/"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    https://www.shedbody.com
                  </Link>
                </p>
              </header>

              {/* Content Sections */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  What Are Cookies
                </h2>

                <p>
                  As is common practice with almost all professional websites
                  this site uses cookies, which are tiny files that are
                  downloaded to your computer, to improve your experience. This
                  page explains what information they collect, how we use it and
                  why we sometimes need to store these cookies. We will also
                  share how you can prevent these cookies from being stored
                  however this may downgrade or &apos;break&apos; certain
                  elements of the sites functionality.
                </p>

                <p>
                  For more general information on cookies, please read &quot;
                  <a
                    href="https://www.cookieconsent.com/what-are-cookies/"
                    target="_blank"
                    className="no-underline text-green-400 hover:text-green-300 transition"
                  >
                    What Are Cookies
                  </a>
                  &quot;.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  How We Use Cookies
                </h2>

                <p>
                  We use cookies for the terms of reasons detailed below.
                  Unfortunately in most cases there are not any industry
                  standard options for disabling cookies without completely
                  disabling the functionality and features they add to this
                  site. It&apos;s recommended that you just leave on all cookies
                  if you&apos;re unsure whether you need them or not in case
                  they&apos;re accustomed provide a service that you use.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Your Choices Regarding Cookies
                </h2>

                <p>
                  You can prevent the setting of cookies by adjusting the
                  settings on your browser (see your browser Help for how to try
                  and do this). Bear in mind that disabling cookies will affect
                  the functionality of this and plenty of other websites that
                  you visit. Disabling cookies will usually lead to also
                  disabling certain functionality and features of the this
                  website. Therefore it&apos;s recommended that you just
                  don&apos;t disable cookies.
                </p>

                <p>
                  If You prefer to avoid the use of Cookies on the Website,
                  first You must disable the use of Cookies in your browser and
                  then delete the saved Cookies in your browser associated with
                  this website. You may use this option for preventing the use
                  of Cookies at any time.
                </p>

                <p>
                  If You do not accept Our Cookies, You may experience some
                  inconvenience in your use of the Website and some features may
                  not function properly.
                </p>

                <p>
                  If You&apos;d like to delete Cookies or instruct your web
                  browser to delete or refuse Cookies, please visit the help
                  pages of your web browser.
                </p>

                <p>
                  For any other web browser, please visit your web
                  browser&apos;s official web pages.
                </p>

                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-green-400">
                  <li>
                    For the Chrome web browser, please visit this page from
                    Google:{" "}
                    <a
                      href="https://support.google.com/accounts/answer/32050"
                      className="no-undeline text-green-400 hover:text-green-300 transition"
                      target="_blank"
                    >
                      https://support.google.com/accounts/answer/32050
                    </a>
                  </li>
                  <li>
                    For the Internet Explorer web browser, please visit this
                    page from Microsoft:{" "}
                    <a
                      href="https://support.microsoft.com/kb/278835"
                      className="no-undeline text-green-400 hover:text-green-300 transition"
                      target="_blank"
                    >
                      https://support.microsoft.com/kb/278835
                    </a>
                  </li>
                  <li>
                    For the Firefox web browser, please visit this page from
                    Mozilla:
                    <a
                      href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored"
                      className="no-undeline text-green-400 hover:text-green-300 transition"
                      target="_blank"
                    >
                      https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored
                    </a>
                  </li>
                  <li>
                    For the Safari web browser, please visit this page from
                    Apple:
                    <a
                      href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                      className="no-undeline text-green-400 hover:text-green-300 transition"
                      target="_blank"
                    >
                      https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac
                    </a>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  The Cookies We Set
                </h2>

                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-green-400">
                  <li>
                    <strong>Account related cookies:</strong> If you create an
                    account with us then we will use cookies for the management
                    of the signup process and general administration. These
                    cookies will usually be deleted when you log out however in
                    some cases they may remain afterwards to remember your site
                    preferences when logged out.
                  </li>
                  <li>
                    <strong>Login related cookies:</strong> We use cookies when
                    you are logged in so that we can remember this fact. This
                    prevents you from having to log in every single time you
                    visit a new page. These cookies are typically removed or
                    cleared when you log out to ensure that you can only access
                    restricted features and areas when logged in.
                  </li>
                  <li>
                    <strong>Email newsletters related cookies:</strong> This
                    site offers newsletter or email subscription services and
                    cookies may be used to remember if you are already
                    registered and whether to show certain notifications which
                    might only be valid to subscribed/unsubscribed users.
                  </li>
                  <li>
                    <strong>Orders processing related cookies:</strong> This
                    site offers e-commerce or payment facilities and some
                    cookies are essential to ensure that your order is
                    remembered between pages so that we can process it properly.
                  </li>
                  <li>
                    <strong>Surveys related cookies:</strong> From time to time
                    we offer user surveys and questionnaires to provide you with
                    interesting insights, helpful tools, or to understand our
                    user base more accurately. These surveys may use cookies to
                    remember who has already taken part in a survey or to
                    provide you with accurate results after you change pages.
                  </li>
                  <li>
                    <strong>Forms related cookies:</strong> When you submit data
                    to through a form such as those found on contact pages or
                    comment forms cookies may be set to remember your user
                    details for future correspondence.
                  </li>
                  <li>
                    <strong>Site preferences cookies:</strong> In order to
                    provide you with a great experience on this site we provide
                    the functionality to set your preferences for how this site
                    runs when you use it. In order to remember your preferences
                    we need to set cookies so that this information can be
                    called whenever you interact with a page is affected by your
                    preferences.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Third Party Cookies
                </h2>

                <p>
                  In some special cases we also use cookies provided by trusted
                  3rd parties. The subsequent section details which third party
                  cookies you would possibly encounter through this website.
                </p>

                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-green-400">
                  <li>
                    This site uses Google Analytics which is one of the most
                    widespread and trusted analytics solution on the web for
                    helping us to understand how you use the site and ways that
                    we can improve your experience. These cookies may track
                    things such as how long you spend on the site and the pages
                    that you visit so we can continue to produce engaging
                    content.For more information on Google Analytics cookies,
                    see the official Google Analytics page.
                  </li>
                  <li>
                    Third party analytics are used to track and measure usage of
                    this site so that we can continue to produce engaging
                    content. These cookies may track things such as how long you
                    spend on the site or pages you visit which helps us to
                    understand how we can improve the site for you.
                  </li>
                  <li>
                    From time to time we test new features and make subtle
                    changes to the way that the site is delivered. When we are
                    still testing new features these cookies may be used to
                    ensure that you receive a consistent experience whilst on
                    the site whilst ensuring we understand which optimizations
                    our users appreciate the most.
                  </li>
                  <li>
                    As we sell products it&apos;s important for us to understand
                    statistics about how many of the visitors to our site
                    actually make a purchase and as such this is the kind of
                    data that these cookies will track. This is important to you
                    as it means that we can accurately make business predictions
                    that allow us to monitor our advertising and product costs
                    to ensure the best possible price.
                  </li>
                  <li>
                    The Google AdSense service we use to serve advertising uses
                    a DoubleClick cookie to serve more relevant ads across the
                    web and limit the number of times that a given ad is shown
                    to you. For more information on Google AdSense see the
                    official Google AdSense privacy FAQ.
                  </li>
                  <li>
                    We use adverts to offset the costs of running this site and
                    provide funding for further development. The behavioural
                    advertising cookies used by this site are designed to ensure
                    that we provide you with the most relevant adverts where
                    possible by anonymously tracking your interests and
                    presenting similar things that may be of interest.
                  </li>
                  <li>
                    Several partners advertise on our behalf and affiliate
                    tracking cookies simply allow us to see if our customers
                    have come to the site through one of our partner sites so
                    that we can credit them appropriately and where applicable
                    allow our affiliate partners to provide any bonus that they
                    may provide you for making a purchase.
                  </li>
                  <li>
                    We also use social media buttons and/or plugins on this site
                    that allow you to connect with your social network in
                    various ways. For these to work the following social media
                    sites including; (Facebook, Instagram, Twitter, Pinterest,
                    LinkedIn, YouTube), will set cookies through our site which
                    may be used to enhance your profile on their site or
                    contribute to the data they hold for various purposes
                    outlined in their respective privacy policies.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  More Information
                </h2>

                <p>
                  Hopefully that has clarified things for you and as was
                  previously mentioned if there is something that you
                  aren&apos;t sure whether you need or not it&apos;s usually
                  safer to leave cookies enabled in case it does interact with
                  one of the features you use on this website.
                </p>

                <p>
                  However if you are still looking for more information then you
                  can contact us through one of our preferred contact methods:
                </p>
                <ul className="space-y-2 pl-5 list-disc list-outside marker:text-green-400">
                  <li>
                    By email:{" "}
                    <a
                      href="mailto:support@shedbody.com"
                      target="_blank"
                      className="no-underline text-green-400 hover:text-green-300 transition"
                    >
                      support@shedbody.com
                    </a>
                  </li>
                  <li>
                    By visiting this page on our website:{" "}
                    <Link
                      href="/contact-us"
                      className="no-underline text-green-400 hover:text-green-300 transition"
                    >
                      contact us
                    </Link>
                  </li>
                </ul>
              </section>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
