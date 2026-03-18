import Link from "next/link";
import SearchPosts from "./SearchPosts";

export default function Header() {
  return (
    <header className="border-b border-grey-800 bg-black">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-bold text-green-400 tracking-wide">
            ShedBody
          </span>
        </Link>

        <nav className="space-x-8 text-sm">
          <Link href="/articles" className="nav-link">
            Articles
          </Link>

          <Link href="/workouts" className="nav-link">
            Workouts
          </Link>

          <Link href="/yoga" className="nav-link">
            Yoga
          </Link>

          <Link href="/nutrition" className="nav-link">
            Nutrition
          </Link>

          <Link href="/fitness" className="nav-link">
            Fitness
          </Link>
          <Link href="/recipes" className="nav-link">
            Recipes
          </Link>
        </nav>
      </div>

      <SearchPosts />
    </header>
  );
}
