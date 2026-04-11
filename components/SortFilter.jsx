import Link from "next/link";

export default function SortFilter({
  category,
  currentSort = "latest",
  currentSearch = "",
}) {
  const sortOptions = [
    { id: "latest", label: "Latest" },
    { id: "oldest", label: "Oldest" },
    { id: "popular", label: "Popular" },
  ];

  // Smart URL Builder
  const createSortUrl = (sortId) => {
    const params = new URLSearchParams();

    params.set("sort", sortId);

    if (currentSearch) {
      params.set("search", currentSearch);
    }

    return `/${category}?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {sortOptions.map((option) => {
        const isActive = currentSort === option.id;

        return (
          <Link
            key={option.id}
            href={createSortUrl(option.id)}
            scroll={false}
            className={`px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-emerald-500 text-black font-semibold"
                : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-emerald-500"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
