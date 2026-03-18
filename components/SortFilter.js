import Link from "next/link";

export default function SortFilter({ category, currentSort, currentSearch }) {
  return (
    <div className="flex gap-4 mb-8">
      <Link
        href={`/${category}?sort=latest&search=${currentSearch}`}
        className={`px-4 py-2 rounded ${
          currentSort === "latest"
            ? "bg-green-600 text-black"
            : "bg-zinc-900 border border-zinc-800 hover:border-green-500 transition"
        }`}
      >
        Latest
      </Link>

      <Link
        href={`/${category}?sort=oldest&search=${currentSearch}`}
        className={`px-4 py-2 rounded ${
          currentSort === "oldest"
            ? "bg-green-600 text-black"
            : "bg-zinc-900 border border-zinc-800 hover:border-green-500 transition"
        }`}
      >
        Oldest
      </Link>

      <Link
        href={`/${category}?sort=popular&search=${currentSearch}`}
        className={`px-4 py-2 rounded ${
          currentSort === "popular"
            ? "bg-green-600 text-black"
            : "bg-zinc-900 border border-zinc-800 hover:border-green-500 transition"
        }`}
      >
        Popular
      </Link>
    </div>
  );
}
