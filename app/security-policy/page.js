import Link from "next/link";

export const metadata = {
  title: "Security Policy",
  description:
    "Learn how ShedBody protects accounts, secures data, prevents abuse, and maintains platform integrity through modern security practices.",
  alternates: {
    canonical: "https://shedbody.com/security-policy",
  },
  openGraph: {
    title: "Security Policy",
    description:
      "How ShedBody protects accounts, secures data, and maintains platform security.",
    url: "https://shedbody.com/security-policy",
    siteName: "ShedBody",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    title: "Platform Security",
    content: (
      <>
        <p>
          ShedBody is built with a modern security-first architecture designed
          to protect user accounts, application infrastructure, and platform
          integrity at every layer.
        </p>
        <p>
          Our infrastructure is powered by Cloudflare, Vercel, and Supabase,
          helping us deliver strong network protection, secure deployment
          pipelines, and reliable backend services.
        </p>
      </>
    ),
  },
  {
    title: "Account Protection",
    content: (
      <>
        <p>
          We actively protect account-related routes such as sign in, sign up,
          and authentication endpoints through layered security controls.
        </p>
        <ul>
          <li>Intelligent request filtering</li>
          <li>Automated suspicious traffic challenges</li>
          <li>Authentication abuse detection</li>
          <li>Brute-force protection mechanisms</li>
          <li>Route-level request validation</li>
        </ul>
      </>
    ),
  },
  {
    title: "Bot & Abuse Prevention",
    content: (
      <>
        <p>
          To maintain a fair and secure platform, ShedBody uses automated abuse
          prevention systems that monitor malicious behavior patterns.
        </p>
        <ul>
          <li>Rate limiting on sensitive endpoints</li>
          <li>Automated exploit request blocking</li>
          <li>Suspicious query inspection</li>
          <li>Credential stuffing mitigation</li>
          <li>Spam and automated signup prevention</li>
        </ul>
      </>
    ),
  },
  {
    title: "Data Protection",
    content: (
      <>
        <p>
          Security of user data is treated as a core platform responsibility.
          Sensitive communication is encrypted in transit using HTTPS/TLS
          protocols.
        </p>
        <p>
          Access to protected systems is restricted using modern authentication,
          access controls, and infrastructure-level safeguards.
        </p>
      </>
    ),
  },
  {
    title: "Infrastructure Monitoring",
    content: (
      <>
        <p>
          We continuously monitor platform traffic and security signals to
          detect anomalies, suspicious patterns, and abuse attempts.
        </p>
        <ul>
          <li>Traffic inspection and filtering</li>
          <li>Request anomaly detection</li>
          <li>Security rule enforcement</li>
          <li>Infrastructure event monitoring</li>
          <li>Rapid mitigation for malicious activity</li>
        </ul>
      </>
    ),
  },
  {
    title: "Responsible Disclosure",
    content: (
      <>
        <p>
          If you discover a security issue, vulnerability, or suspicious
          behavior related to ShedBody, we encourage responsible disclosure.
        </p>
        <p>
          Please report security concerns privately so they can be investigated
          and resolved appropriately.
        </p>
      </>
    ),
  },
];

export default function SecurityPolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:px-8 lg:px-10">
      <header className="mb-14 border-b border-zinc-200 pb-10 dark:border-zinc-800">
        <span className="inline-flex rounded-full border border-zinc-300 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Security
        </span>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
          Security Policy
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-300 md:text-lg">
          At ShedBody, platform security is a continuous priority. We use modern
          infrastructure, layered protection systems, and proactive monitoring
          to protect users, safeguard data, and preserve platform integrity.
        </p>

        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: May 1, 2026
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {section.title}
            </h2>

            <div className="mt-4 space-y-4 text-[15px] leading-8 text-zinc-600 dark:text-zinc-300 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-3xl border border-zinc-900 bg-zinc-950 p-8 text-white dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">Report a Security Concern</h2>

        <p className="mt-4 max-w-3xl leading-8 text-zinc-300">
          If you believe you’ve identified a vulnerability, suspicious activity,
          or a platform security concern, contact us directly and include as
          much relevant detail as possible for investigation.
        </p>

        <Link
          href="/contact-us"
          className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:scale-[1.02]"
        >
          Contact Security Team
        </Link>
      </section>
    </main>
  );
}
