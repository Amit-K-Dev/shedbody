import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { getOrganizationSchema } from "@/lib/schema";
import { safeJsonLd } from "@/lib/security/html";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

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
    "shed body",
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

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ShedBody",
    title: "ShedBody",
    description:
      "Transform your body with structured workouts, nutrition guidance, and consistency.",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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

  other: {
    "google-adsense-account": "ca-pub-9117254807197165",
  },
};

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  const schema = getOrganizationSchema();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased`}
      >
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9117254807197165"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* SEO SCHEMA */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />

        <main className="min-h-screen">{children}</main>

        <Toaster />
        <BackToTop />
      </body>
    </html>
  );
}
