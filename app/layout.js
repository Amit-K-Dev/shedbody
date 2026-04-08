import { Oswald, Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  metadataBase: new URL("https://shedbody.com"),

  title: {
    default: "ShedBody: Build Muscle. Lose Fat. Live Strong.",
    template: "%s | ShedBody",
  },
  description:
    "ShedBody delivers practical fitness, weight loss, workout, yoga, and nutrition guides to help you build a healthier body and sustainable lifestyle.",

  keywords: [
    "ShedBody",
    "fitness",
    "fat loss",
    "workout plans",
    "yoga",
    "nutrition",
    "healthy lifestyle",
    "weight loss India",
  ],

  authors: [{ name: "ShedBody" }],
  creator: "ShedBody",
  publisher: "ShedBody",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://shedbody.com",
    siteName: "ShedBody",
    title: "ShedBody",
    description:
      "Tranform your body with structured workouts, nutrition guidance, and consistency.",
    images: [
      {
        url: "https://shedbody.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShedBody",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ShedBody",
    description:
      "Fitness, fat loss, yoga, and healthy lifestyle guidance that actually works.",
    images: ["https://shedbody.com/og-image.jpg"],
  },

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
  },
};

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  varible: "--font-inter",
});

export default async function RootLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ShedBody",
      url: "https://shedbody.com",
      logo: "https://shedbody.com/logo.png",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://shedbody.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "ShedBody",
      url: "https://shedbody.com",
      logo: "https://shedbody.com/logo.png",
      sameAS: [
        "https://youtube.com/@shed-body",
        "https://linkedin.com/company/shedbody",
        "https://facebook.com/shedbody",
        "https://instagram.com/shedbody_",
        "https://pinterest.com/shedbody",
        "https://twitter.com/shedbody",
      ],
    },
  ];

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased`}
      >
        {/* SEO SCHEMA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <main className="min-h-screen">{children}</main>

        <Toaster />
        <BackToTop />
      </body>
    </html>
  );
}
