import Link from "next/link";
import { BicepsFlexed } from "lucide-react";
import {
  siFacebook,
  siInstagram,
  siPinterest,
  siX,
  siYoutube,
} from "simple-icons";

const categories = [
  { name: "Yoga", slug: "yoga" },
  { name: "Workouts", slug: "workouts" },
  { name: "Nutrition", slug: "nutrition" },
  { name: "Health", slug: "health" },
];

const linkedinIcon = {
  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

const socialLinks = [
  { name: "YouTube", href: "https://youtube.com/@shed-body", icon: siYoutube },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/shedbody",
    icon: linkedinIcon,
  },
  {
    name: "Facebook",
    href: "https://facebook.com/shedbody",
    icon: siFacebook,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/shedbody_",
    icon: siInstagram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/shedbody",
    icon: siPinterest,
  },
  { name: "X", href: "https://twitter.com/shedbody", icon: siX },
];

function SocialIconLink({ href, icon, name }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Follow ShedBody on ${name}`}
      title={name}
      className="group/social relative grid size-10 place-items-center overflow-hidden rounded-full border border-zinc-700/80 bg-zinc-950/90 text-zinc-300 shadow-lg shadow-black/20 outline-none transition duration-300 before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_35%_20%,rgba(52,211,153,0.34),rgba(16,185,129,0.12)_42%,rgba(9,9,11,0)_72%)] before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-1 hover:border-emerald-300/80 hover:bg-emerald-950/30 hover:text-emerald-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.28)] hover:before:opacity-100 focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400/40"
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative z-10 size-4 transition duration-300 group-hover/social:scale-110 group-hover/social:drop-shadow-[0_0_8px_rgba(110,231,183,0.72)]"
        fill="currentColor"
      >
        <path d={icon.path} />
      </svg>
      <span className="sr-only">{name}</span>
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-700 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h2 className="flex items-center text-xl font-bold tracking-wide group">
            <BicepsFlexed
              size={22}
              className="text-emerald-400 mr-2 group-hover:scale-110 transition"
            />
            <span className="text-zinc-50">Shed</span>
            <span className="text-emerald-500">Body</span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Practical fitness, yoga, and nutrition guides to help you build a
            stronger, healthier body - step by step.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {socialLinks.map((social) => (
              <SocialIconLink key={social.name} {...social} />
            ))}
          </div>
        </div>

        {/* Pages */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
            Pages
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/about" className="hover:text-zinc-50">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="hover:text-zinc-50">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-zinc-50">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-use" className="hover:text-zinc-50">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-zinc-50 text-sm font-semibold mb-3 uppercase tracking-wide">
            Categories
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/${cat.slug}`} className="hover:text-zinc-50">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-700 py-4 text-center text-sm text-zinc-400 p-3">
        <p>&copy; {new Date().getFullYear()} ShedBody. All rights reserved.</p>
        <small>
          Our website services, content, and products are for informational
          puposes only. ShedBody does not provide medical advice, diagnosis, or
          teatment. <Link href="/terms-of-use">See more information</Link>.
        </small>
      </div>
    </footer>
  );
}
