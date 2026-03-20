import Link from "next/link";

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
          <h2 className="text-xl font-bold text-green-400">
            <span className="text-white">Shed</span>Body
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Practical fitness, yoga, and nutrition guides to help you build a
            stronger, healthier body - step by step.
          </p>
        </div>

        {/* Pages */}
        <div>
          <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
            Pages
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/pages/about-us" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/pages/contact-us" className="hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/pages/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/pages/terms-of-use" className="hover:text-white">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
            Categories
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/${cat.slug}`} className="hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-700 py-4 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} ShedBody. All rights reserved.</p>
        <small>
          Our website services, content, and products are for informational
          puposes only. ShedBody does not provide medical advice, diagnosis, or
          teatment. <Link href="/pages/terms-of-use">See more information</Link>
          .
        </small>
      </div>
    </footer>
  );
}
