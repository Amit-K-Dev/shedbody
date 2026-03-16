import Link from "next/link";

export default function Breadcrumbs({ category, title }) {
  const categorySlug = category
    ? category.toLowerCase().replace(/\s+/g, "-")
    : "";
  return (
    <nav className="text-sm text-gray-400 mb-6">
      <Link href="/" className="hover:text-green-400">
        Home
      </Link>

      {" > "}
      {category && (
        <>
          <Link
            href={`/${categorySlug}`}
            className="hover:text-green-400 capitalize"
          >
            {category}
          </Link>
        </>
      )}

      {" > "}
      {title && (
        <>
          <span className="text-gray-300">{title}</span>
        </>
      )}
    </nav>
  );
}
