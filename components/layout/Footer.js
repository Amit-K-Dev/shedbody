import Link from "next/link";
import { BicepsFlexed } from "lucide-react";

const categories = [
  { name: "Yoga", slug: "yoga" },
  { name: "Workouts", slug: "workouts" },
  { name: "Nutrition", slug: "nutrition" },
  { name: "Health", slug: "health" },
];

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
          <h3 className="text-zic-50 text-sm font-semibold mb-3 uppercase tracking-wide">
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
