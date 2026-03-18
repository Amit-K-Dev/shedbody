import Link from "next/link";

export default function Pagination({
  category,
  page,
  totalPages,
  sort,
  search,
}) {
  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      {/* Prev */}
      <Link
        href={
          page - 1 === 1
            ? `/${category}`
            : `/${category}?page=${page - 1}&sort=${sort}&search=${search}`
        }
        scroll={false}
        className={`px-4 py-2 rounded ${
          page === 1
            ? "opacity-50 pointer-events-none bg-gray-400"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        &larr; Prev
      </Link>

      {/* Numbered Pagination */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        {Array.from({ length: totalPages }, (_, i) => {
          const p = i + 1;

          return (
            <Link
              key={p}
              href={p === 1 ? `/${category}` : `/${category}?page=${p}`}
              className={`px-3 py-1 rounded ${
                p === page
                  ? "bg-green-500 text-black"
                  : "bg-zinc-900 border border-zinc-800 hover:border-green-500 transition"
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Next */}
      <Link
        href={`/${category}?page=${page + 1}&sort=${sort}&search=${search}`}
        scroll={false}
        className={`px-4 py-2 rounded ${
          page === totalPages
            ? "opacity-50 pointer-events-none bg-gray-700"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        Next &rarr;
      </Link>
    </div>
  );
}
