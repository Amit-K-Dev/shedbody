import { Oswald, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import BackToTop from "@/components/BackToTop";

export const metadata = {
  title: {
    default: "ShedBody: Build Muscle. Lose Fat. Live Strong.",
    template: "%s | ShedBody",
  },
  description:
    "ShedBody delivers practical fitness, weight loss, workout, and nutrition guides to help you build a healthier body and sustainable lifestyle.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
