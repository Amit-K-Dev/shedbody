import Link from "next/link";
import { Mail, MapPin, Globe } from "lucide-react";

export const metadata = {
  title: "Terms of use",
  description:
    "These Terms of Use described the legally obligatory terms and conditions that oversee your use of the site.",

  keywords: [
    "terms of use",
    "fitness platform",
    "terms and conditions",
    "workout guides",
    "yoga guides",
    "nutrition advice",
    "weight loss india",
  ],

  alternates: {
    canonical: "/terms-of-use",
  },
};

export default function TermsOfUsePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TermsOfUsePage",
    name: "Terms of use",
    url: "https://shedbody.com/terms-of-use",
    description:
      "These Terms of Use described the legally obligatory terms and conditions that oversee your use of the site.",
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
            {/* Article Header */}
            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Terms of use
              </h1>

              <p className="max-w-2xl mx-auto text-lg">
                Last updated March 25, 2026
              </p>
            </header>

            {/* Content Sections */}
            <div className="space-y-4">
              <p>
                The ShedBody website located at{" "}
                <Link
                  href="/"
                  className="no-underline text-green-400 hover:text-green-300 transition"
                >
                  https://www.shedbody.com
                </Link>{" "}
                is copyrighted work related to ShedBody. Certain features of the
                Site may be subject to additional guidelines, conditions or
                rules that will be posted on the Site in relation to such
                features.
              </p>

              <p>
                All these additional terms, guidelines and rules are
                incorporated by reference into these terms.
              </p>

              <p>
                These Terms of Use described the legally obligatory terms and
                conditions that oversee your use of the site. By logging into
                the site, you are meeting these conditions and you indicate that
                you have the right and ability to enter these conditions. You
                must be past 18 years of age to use the site. If you meet all
                the provisions of this rule, do not use the Intu and/or Site.
              </p>

              <p>
                These conditions require the use of arbitration section 10.2 on
                an individual basis to resolve disputes and should also limit
                the remedies available to you in the event of a dispute. These
                Terms of Use, Terms of Use and Privacy Policy were created with
                the help of a sample.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Access site</h2>

              <p>
                <strong>Subject to these conditions</strong>. The ShedBody
                grants you a non-transferable, non-exclusive, repatriable,
                limited license to access the Site for your own, non-commercial
                use only.
              </p>

              <p>
                <strong>Some restrictions</strong>. The rights allowed to you in
                these terms are subjected to the following restrictions:{" "}
                <strong>(A)</strong> you will not sell, rent, lease, distribute,
                assign, transfer, host or otherwise commercially exploit the
                Site;
                <strong>(B)</strong> You shall not alter, may derivative works
                of any part of the Site, cassettes, reverse compile or reverse
                engineers;
                <strong>(C)</strong> You shall not utilize the Site to create or
                build a similar or competitive website;
                <strong>(D)</strong> as expressly declared, no part of the Site
                may be duplicated, reproduced, distributed, republished,
                displayed, downloaded, posted or transmitted in any manner or by
                any means. Unless otherwise indicated, any future releases,
                updates, or other terms of functionality of the site will be
                subject to these conditions. All copyright and other proprietary
                declarations on the site must be preserved on all copies.
              </p>

              <p>
                ShedBody reserves the right to change, suspend or stop the site,
                with or without notice to you. You agree that you or any third
                party will not be held liable for any change, disruption or
                termination of the company or any part of it.
              </p>

              <p>
                <strong>No support or maintenance</strong>. You agree that the
                Company shall have no obligation to provide you any assistance
                with respect to the Site.
              </p>

              <p>
                Except for any user content that you provide, you are aware that
                all intellectual property rights, including copyrights, patents,
                trademarks, and trade secrets in the site and its content, are
                owned by the company or suppliers of the company. Note that
                these Terms and Admittance to the Site do not give you any
                rights, title or interest in or to any intellectual property
                rights, except for the restricted access rights expressed in
                Section 2.1. All rights reserved to the company and its
                suppliers are not provided in these terms.
              </p>

              <h3 className="text-xl font-semibold text-white">User content</h3>

              <p>
                &quot;User Content&quot; means any and all information and
                content that the User submits to the Site. You&apos;re
                exclusively liable/responsible for your user content. You bear
                all the risks associated with the use of your User Content. You
                hereby confirm that your User Content does not violate our
                Acceptable Use Policy. You may not represent or imply to others
                that your User Content is in any way provided, sponsored or
                endorsed by the ShedBody. Because you alone are responsible for
                your user content, you can expose yourself to liability.
                ShedBody is not obligated to back up any user content you post;
                Also, your user content may be removed at any time without prior
                notice. If you wish, you are solely responsible for making your
                own backup copies of your User Content.
              </p>

              <p>
                You hereby provide the ShedBody with an irrevocable,
                non-reputable, royalty-free and fully-paid, worldwide license to
                distribute, distribute, publicly display and perform, engage in
                other functions, and other Grant to engage in functions and
                otherwise use and exploit their user content. To provide
                subordination of the foregoing rights, only for the purposes of
                including your user content in the site. You reject any claim
                and assertion of moral rights or attention with respect to your
                User Content.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Acceptable Use Policy
              </h3>

              <p>
                The following terms constitute our &quot;Acceptable Use
                Policy&quot;: You may collect, upload, transmit, display, (i)
                any User Content that infringes the rights of any third party or
                any intellectual property or proprietary rights. Agree not to
                use the Site to deliver or distribute; (ii) that is unlawful,
                harassing, abusive, torturing, threatening, harmful,
                other&apos;s privacy, rudeness, slander, untrue, intentionally
                deceptive, abusive to business, obscene, obscene, offensive,
                offensive, offensive As offensive, offensively aggressive,
                promotes racism, hatred, hatred, or physical. Damage of any kind
                against any group or individual; (iii) which is in any way
                harmful to minors; Or (iv) which violates any law, regulation or
                obligations or restrictions imposed by a third party.
              </p>

              <p>
                Furthermore, you do not agree to (i) upload, transmit or
                distribute or distribute any software through the Site to damage
                or alter computer systems or data; (ii) send the site through
                unsolicited or unauthorized advertisements, promotional
                materials, junk mail, spam, chain letters, pyramid schemes, or
                any other type of duplicate or unsolicited messages; (iii) use
                the Site to collect, collect, assemble, or collect information
                or data about other users without their consent; (iv) causing
                interference, interference or undue burden on the servers or
                networks connected to the site or violating the rules, policies
                or procedures of such networks; (v) attempt to gain unauthorized
                access to the site, whether through password mining or any other
                means; (vi) harassing or interfering with another user&apos;s
                use and enjoyment of the site; Or (vi) use software or automated
                agents or scripts to create multiple accounts on the site, or to
                generate automated searches, requests or queries on the site.
              </p>

              <p>
                If you violate the Acceptable Use Policy or any other provision
                of these Terms or otherwise create liability for us or any other
                person, we will review any User Content and take appropriate
                action against you in your discretion and/or We reserve the
                right to investigate. Such action may include deleting or
                modifying your user content, terminating your Account in
                accordance with Section 8 and/or reporting to you to law
                enforcement authorities.
              </p>

              <p>
                If you provide any feedback or suggestion regarding the site to
                the company, you grant the ShedBody all rights in such feedback
                and agree that the company is entitled to any such feedback and
                any related information Will have the right to use and fully
                exploit it. ShedBody will treat any Feedback you provide to the
                company as non-confidential and non-proprietary.
              </p>

              <p>
                You agree to indemnify and hold ShedBody and its officers,
                employees, and agents, including costs and attorneys&apos; fees,
                for any claim or demand made by a third party or for your (a)
                use of the Site, (b) Violation of these terms, (c) violation of
                your applicable laws or regulations or (d) your user content.
                The company reserves the right to assume special defense and
                control for any matter for which you are required to indemnify
                us, and you agree to cooperate with us in the defense of these
                claims. You do not agree to settle any matter without the prior
                written consent of the company. The ShedBody will use reasonable
                efforts to notify you of any such claim, action or proceeding.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Third-party links and advertising; Other users
              </h3>

              <h4 className="text-lg font-semibold text-white">
                Third-party links and advertising
              </h4>

              <p>
                The Site may contain links to third-party websites and services
                and/or may display advertisements for third-parties. Such
                third-party links and advertisements are not under the
                ShedBody&apos;s control, and the ShedBody is not responsible for
                any third-party links and advertisements. The ShedBody grants
                you access to these third-party links and advertisements only as
                a convenience and does not review, approve, monitor, endorse,
                warrant, or warrant any representation in relation to
                third-party links and advertisements or Does not do. You use all
                third-party links and advertisements at your own risk, and in
                doing so must apply an appropriate level of caution and
                discretion. When you click on any third-party link and
                advertisement, applicable third party terms and policies,
                including third-party privacy and data gathering practices,
                apply.
              </p>

              <h4 className="text-lg font-semibold text-white">Other users</h4>

              <p>
                Each Site user is solely responsible for any and their own user
                content. Because we do not handle user content, you acknowledge
                and agree that we are not responsible for any user content,
                whether provided by you or by others. You agree that the
                ShedBody will not be responsible for any loss or damage
                resulting from any such interactions. If there is a dispute
                between you and a site user, we are not obligated to join.
              </p>

              <p>
                You hereby free the ShedBody and our officers, employees,
                agents, successors, forever, and provide for it, and in
                addition, each and every past, present and future disputes,
                claims, disputes, demands, rights. , Obligation, discharge the
                obligation. The action and cause of every kind and nature, which
                has arisen directly or indirectly, or which is directly or
                indirectly related to the site. If you are a California
                resident, you waive California Civil Code section 1542 regarding
                the foregoing, stating: &quot;A general release does not extend
                to claims that the creditor does not know or have. There is no
                doubt of being present in favor. Time to execute the release, if
                known by him, will have to affect his settlement with the
                debtor.&quot;
              </p>

              <h4 className="text-lg font-semibold text-white">
                Cookies and Web Beacons
              </h4>

              <p>
                Like any other website, ShedBody uses &apos;cookies&apos;. These
                cookies are used to store information, including the preferences
                of visitors, and the pages on the website that the visitor
                accessed or visited. The information is used to optimize users
                &apos;experience by customizing our web page content based on
                visitors&apos; browser type and/or other information.
              </p>

              <h4 className="text-lg font-semibold text-white">
                Google DoubleClick DART Cookie
              </h4>

              <p>
                Google is one of the third-party vendors on our site. It is also
                known as cookies, known as DART cookies, to advertise to
                visitors to our site based on their visit to{" "}
                <Link
                  href="/"
                  className="no-underline text-green-400 hover:text-green-300 transition"
                >
                  www.shedbody.com
                </Link>{" "}
                and other sites on the Internet. However, visitors can choose to
                decline the use of DART cookies by visiting the Google
                Advertising and Content Network Privacy Policy at the following
                URL -
                <a
                  href="https://polatics.google.com/technologies/ads"
                  target="_blank"
                  className="no-underline text-green-400 hover:text-green-300 transition"
                >
                  https://polatics.google.com/technologies/ads
                </a>
              </p>

              <h4 className="text-lg font-semibold text-white">
                Our Advertising Partner
              </h4>

              <p>
                Some advertisers on our website can use cookies and web beacons.
                Our advertising partners are listed below. Each of our
                advertising partners has its own privacy policy for its own
                policies on user data. For easy access, we have hyperlinked
                below to their privacy policies.
              </p>

              <ul className="space-y-2 list-dsc list-inside marker:text-green-400">
                <li>
                  Google:{" "}
                  <a href="https://policies.google.com/technologies/ads">
                    https://policies.google.com/technologies/ads
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Disclaimer</h2>

              <p>
                ShedBody is a DIGITAL PUBLISHER AND DOES NOT OFFER PERSONAL
                HEALTH OR MEDICAL ADVICE. If you are facing a medical emergency,
                call your local emergency services, or visit the largest
                emergency room or urgent care center. You can tell your health
                proctor before coming to any nutrition, diet, exercise, fitness,
                medical, or welcome program.
              </p>

              <p>
                THE SITE IS PROVIDED ON AN &quot;AS IS&quot; AND
                &quot;AVAILABLE&quot; BASIS, AND SHEDBODY AND OUR SUPPLIERS
                EXPRESSLY ACCEPT ALL WARRANTIES AND CONDITIONS OF ANY KIND,
                WHETHER EXPRESS, IMPLIED OR STATUTORY, IN ALL WARRANTIES
                Qualification conditions are included: Fitness for a special
                object, title, quiet enjoyment, accuracy, or non-infringement.
                We and our suppliers do not promise that the website will meet
                your necessities, be available on an uninterrupted, timely,
                secure, or error-free basis, or be complete, legal, accurate,
                reliable, free from viruses or other harmful code, Or is safe.
                If applicable law claims any warranty in association to the
                website, all such warranties are limited to ninety (90) days
                from the date of first use.
              </p>

              <p>
                There is no proposal applicable to you if the exclusion of
                allegations of certain judicial charges is not allowed. Some
                jurisdictions extend how long a limited warranty lasts, so the
                limitations may not apply to you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Limit on the liability of ShedBody its licensors
              </h2>

              <p>
                To the maximum extent permitted by law, in no event shall the
                ShedBody or our suppliers be liable for any lost profits, lost
                data, costs of purchasing substitute products, or any indirect,
                consequential, exemplary, incidental. Special or punitive
                damages are related to these conditions or the inability for
                your use or use of the site, even if the ShedBody has been
                advised of the possibility of such damages. Access and use of
                the Site are at its discretion and risk, and you will be solely
                responsible for any damage to your device or computer system, or
                the loss of data resulting from it.
              </p>

              <p>
                To the maximum extent permitted by law, our responsibility for
                any damages arising out of or related to this Agreement,
                regardless of anything to the contrary, shall at all times be
                limited to a maximum of fifty US Dollars (US $50). The presence
                of more than one claim will not increase the aforementioned
                limit. You agree that our suppliers will have no responsibility
                of any kind arising out of or related to this agreement.
              </p>

              <p>
                Some provinces do not permit the limitation or exclusion of
                liability for unintended or consequential damages, so the
                aforementioned limitation or exclusion may not apply to you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Term and Termination
              </h2>

              <p>
                Subject to this section, these conditions will remain in full
                force when using the site. We may suspend or terminate your
                rights to use the Site at any time for any reason at our sole
                discretion, for any use of the Site in violation of these Terms.
                Upon termination of your rights under these Terms, your Account
                and right to access and use the Site will cease immediately. You
                understand that any termination of your account may include
                deleting your user content associated with your account from our
                live database. The ShedBody shall have no liability to you for
                any termination of your rights under these Terms. Even after the
                termination of your rights under these conditions, the following
                provisions of these conditions will remain in effect: 2.5 in
                Section 2, Section 3 and Section 10 through 10.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Copyright Policy
              </h2>

              <p>
                The ShedBody respects the intellectual property of others and
                asks that users of our site do the same. In relation to our
                site, we have adopted and enforced a policy respecting copyright
                law that provides for the removal of any infringing materials
                and the termination of users of our online site who are subject
                to intellectual property rights, including copyright. - Repeat
                violations. If you believe that one of our users, through the
                use of our site, is infringing copyright in a work, and wishes
                to remove the allegedly infringed content, the written notice
                (follow-up) The following information must be provided to our
                designated copyright agent as of 17 USC 17 512 (c)):
              </p>

              <ul className="list-disc list-inside pl-5 space-y-2 marker:text-green-400 mb-4">
                <li>Your physical or electronic signature;</li>
                <li>
                  The license of the copyrighted work you claim to have been
                  infringed;
                </li>
                <li>
                  Identification of the content you claim on our services is a
                  violation and you request us to remove them;
                </li>
                <li>
                  Sufficient data to authorize us to determine such material;
                </li>
                <li>Your address, telephone number, and email address;</li>
                <li>
                  A statement that you have a good faith belief that the use of
                  the offending material is not authorized by the copyright
                  owner, its agent, or the law; and
                </li>
                <li>
                  A statement that the information in the notification is
                  accurate, and under penalty of perjury, that you are either
                  the copyright owner who is allegedly infringed or that you are
                  allowed to act on account of the copyright owner.
                </li>
              </ul>

              <p>
                Please note that, 17 U.S.C. § 512 (f), any misrepresentation of
                material fact in a written notification, automatically written
                notification and a party complaining about liability for any
                damages, costs and attorney&apos;s fees incurred by us on
                charges of copyright infringement subject to.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">GENERAL</h2>

              <p>
                These terms are subject to occasional revisions, and if we make
                any significant changes, we will send you an e-mail to the last
                e-mail address provided by us and/or prominently post the notice
                of changes by us can inform you on our website.
              </p>

              <p>
                You are accountable for providing us with your most current
                email address. In the event that the newest e-mail address you
                have granted to us is not valid, our dispatch of an e-mail
                containing such notice will nevertheless constitute effective
                notice of the changes described in the notice. Any change to
                these terms will take effect as soon as possible in thirty (30)
                calendar days following our posting of the notice of changes on
                our site or for thirty (30) calendar days following our dispatch
                of the e-mail notice.
              </p>

              <p>
                These changes will be useful immediately for new users of our
                website. Your continued use of our site after notice of such
                changes will indicate your acceptance of such changes and
                agreement to be bound by the terms and conditions of such
                changes. dispute resolution. Please read this arbitration
                agreement carefully. This is part of your contract with the
                ShedBody and affects your rights. This includes the processes of
                MANDATORY BINDING ARBITRATION and A CLASS ACTION WAIVER.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Applicability of arbitration agreement
              </h2>

              <p>
                All claims and disputes regarding the terms provided by the
                company or the use of a product or service that cannot be
                resolved informally or in small claims court obligate
                arbitration on an individual basis under the terms of this
                arbitration agreement Will be solved by doing.
              </p>

              <p>
                All arbitration proceedings will be conducted in English unless
                otherwise agreed upon. This compromise agreement applies to you
                and the ShedBody, and any subsidiaries, affiliates, agencies,
                employees, predecessors in interest, followers, and assignments,
                as well as all authorized or unauthorized users or beneficiaries
                of services or goods rendered under the terms, is done.
              </p>

              <h3 className="text-xl font-semibold text-white">
                Notice Requirement and Informal Dispute Resolution
              </h3>

              <p>
                Before unless party may ask compromise, the party must first
                send to the other party a written Notice of Dispute describing
                the nature and basis of the claim or dispute and the requested
                relief. A Notice to the ShedBody should be sent to{" "}
                <a
                  href="mailto:support@shedbody.com"
                  target="_blank"
                  className="text-green-400 no-underline hover:text-green-300 transition"
                >
                  support@shedbody.com
                </a>
                .
              </p>

              <p>
                After the Notice is received, you and the ShedBody may attempt
                to resolve the claim or dispute informally. If you and the
                ShedBody do not resolve the claim or dispute within thirty (30)
                days after the Notice is received, either party may begin an
                arbitration proceeding. The significance of any arrangement
                offer made by any party may not be disclosed to the arbitrator
                until after the arbitrator has determined the amount of the
                award to which either party is entitled.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">TERMINATION</h2>

              <p>
                You can stop using the Services at any time (subject to the
                living conditions present here). ShedBody may terminate these
                Terms of Use and/or Services at any time and may do so
                immediately without notice. Accordingly, ShedBody may deny you
                access to the Services if in ShedBody&apos;s sole discretion you
                fail to abide by any term or provision of the Terms of Use.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">NO WAIVER</h2>

              <p>
                ShedBody&apos;s failure to enforce strict performance of any
                provision of these Terms of Use shall not constitute a waiver of
                ShedBody&apos;s right to enforce this provision or any other
                provision of this Agreement, nor to exercise. There will be any
                delay or omission from ShedBody. Take advantage of whatever
                rights or measures ShedBody may have, or may serve as a waiver
                of any right or remedy.
              </p>

              <p>
                Complete conditions. These Terms discover the complete agreement
                between you and ShedBody regarding the use of the site. Our
                failure to enforce or enforce any right or provision of these
                conditions will not serve as a waiver of such right or
                provision. The section titles in certain terms are for
                convenience only and have no legal or contractual effect.
              </p>

              <p>
                The word &quot;including&quot; means &quot;without
                limitation&quot;. If any provision of these Terms is deemed to
                be invalid or unenforceable, the other provisions of these Terms
                shall not apply and the invalid or unenforceable provision shall
                be deemed amended so that it is valid and enforceable to the
                maximum extent permitted by law.
              </p>

              <p>
                You are related to the ShedBody with an independent contractor,
                and neither party is an agent or partner of the other. These
                Terms, and your rights and obligations hereunder, may not be
                transferred, subcontracted, delegated, or otherwise transferred
                by you without the prior written consent of the ShedBody, and
                any assignment, subcontract, delegation, or transfer in
                violation of the foregoing Will be zero and zero. ShedBody can
                state these conditions independently. The terms and conditions
                mentioned in these rules shall be binding on the assignment.
              </p>

              <p>
                <strong>Your privacy:</strong> Please read our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-green-400 no-underline hover:text-green-300 transition"
                >
                  privacy policy
                </Link>
                .
              </p>
            </section>

            <section className="py-6 mb-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                  {/* Title */}
                  <h2 className="text-2xl font-semibold text-white mt-4 mb-3">
                    Contact Information
                  </h2>

                  <p className="tracking-normal leading-relaxed mb-4">
                    Thank you for your cooperation. We hope you discover our
                    Services helpful and convenient to use.{" "}
                    <em>
                      Questions or comments regarding these Services, including
                      any reports of non-functioning links, should be directed
                      to:
                    </em>
                  </p>

                  {/* Divider */}
                  <div className="border-t border-white/10 mb-6" />

                  {/* Contact Items */}
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <Mail className="text-green-400 mt-1" size={18} />
                      <div>
                        <p className="text-gray-400 text-xs tracking-normal leading-relaxed mb-4">
                          Email:
                        </p>
                        <a
                          href="mailto:support@shedbody.com"
                          className="text-white font-medium hover:text-green-400 transition"
                        >
                          support@shedbody.com
                        </a>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <MapPin className="text-blue-400 mt-1" size={18} />
                      <div>
                        <p className="text-gray-400 text-xs tracking-normal leading-relaxed mb-4">
                          Address:
                        </p>
                        <p className="text-white tracking-normal leading-relaxed mb-4">
                          B-145/1, West Vinod Nagar <br />
                          New Delhi, Delhi 110092 <br />
                          India
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href="https://www.google.com/maps/search/B-145/1,West+Vinod Nagar,+New Delhi,+Delhi,+110092+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open address in Google Maps"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white font-medium hover:bg-green-400 hover:border-green-400 hover:text-black transition"
                    >
                      <Globe size={16} />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </section>
    </>
  );
}
