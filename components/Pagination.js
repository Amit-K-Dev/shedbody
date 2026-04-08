import Link from "next/link";

export default function Pagination({
  category,
  page,
  totalPages,
  sort,
  search,
}) {
  if (totalPages <= 1) return null;

  // SMART URL BUILDER
  const createPageUrl = (pageNumber) => {
    if (pageNumber === 1 && sort === "latest" && !search) {
      return `/${category}`;
    }

    const params = new URLSearchParams();
    if (pageNumber > 1) params.set("page", pageNumber);
    if (sort && sort !== "latest") params.set("sort", sort);
    if (search) params.set("search", search);

    const queryString = params.toString();
    return queryString ? `/${category}?${queryString}` : `/${category}`;
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-12 flex-wrap">
      {/* Prev Button */}
      <Link
        href={createPageUrl(page - 1)}
        scroll={false}
        className={`px-4 py-2 rounded-lg transition ${
          page === 1
            ? "opacity-50 pointer-events-none bg-zinc-800 text-zinc-500"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        }`}
      >
        &larr; Prev
      </Link>

      {/* Numbered Pagination */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => {
          const p = i + 1;
          const isActive = p === page;

          return (
            <Link
              key={p}
              href={createPageUrl(p)}
              className={`px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-emerald-500 text-black font-semibold"
                  : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-emerald-500"
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      <Link
        href={createPageUrl(page + 1)}
        scroll={false}
        className={`px-4 py-2 rounded-lg transition ${
          page === totalPages
            ? "opacity-50 pointer-events-none bg-zinc-800 text-zinc-500"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        }`}
      >
        Next &rarr;
      </Link>
    </div>
  );
}
