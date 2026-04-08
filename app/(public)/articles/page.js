import { getAllPosts, getCategories } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Link from "next/link";

// Dynamic SEO metadata
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "all";
  const page = parseInt(params?.page || "1");

  const baseUrl = "https://shedbody.com";

  let url = `${baseUrl}/articles`;
  const queryParams = [];
  if (category !== "all") queryParams.push(`category=${category}`);
  if (page > 1) queryParams.push(`page=${page}`);

  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }

  // Dynamic Title
  return {
    title:
      category === "all"
        ? "All Articles"
        : `${category.charAt(0).toUpperCase() + category.slice(1)} Articles`,
    description: `Explore ${category === "all" ? "all" : category} fitness, nutrition, and workout guides on ShedBody.`,
    alternates: {
      canonical: url,
    },
  };
}

export default async function ArticlesPage({ searchParams }) {
  const params = await searchParams;

  // Extract current category properly
  const currentCategory = params?.category || "all";
  const page = parseInt(params?.page || "1");
  const limit = 9;

  // Pass the currentCategory to the fetcher!
  const { posts, total } = await getAllPosts(currentCategory, page, limit);
  const categories = await getCategories();

  const totalPages = Math.ceil(total / limit);

  // Helper: URL Generator so pagination remembers the category
  const getPageLink = (newPage) => {
    if (currentCategory === "all") return `/articles?page=${newPage}`;
    return `/articles?category=${currentCategory}&page=${newPage}`;
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      {/* Dynamic Title */}
      <h1 className="text-4xl font-bold mb-6">
        {currentCategory === "all"
          ? "All Articles"
          : `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Articles`}
      </h1>

      <p className="text-zinc-400 mb-10">
        Explore{" "}
        {currentCategory === "all"
          ? "all fitness, nutrition, yoga, workout guides."
          : `our latest guides on ${currentCategory}.`}
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => {
          const isActive = cat === currentCategory;

          return (
            <Link
              key={cat}
              href={cat === "all" ? "/articles" : `/articles?category=${cat}`}
              className={`px-4 py-2 rounded-full transition ${
                isActive
                  ? "bg-emerald-500 text-black font-semibold"
                  : "border text-zinc-300 border-zinc-600 hover:border-emerald-500"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Link>
          );
        })}
      </div>

      {/* Posts Grid */}
      {posts?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 text-lg">
          No articles found in this category yet.
        </div>
      )}

      {/* Pagination Numbers */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-4 mt-12">
          {page > 1 ? (
            <Link
              href={getPageLink(page - 1)}
              className="px-5 py-2 border border-zinc-700 rounded-lg hover:border-emerald-500 transition"
            >
              &larr; Prev
            </Link>
          ) : (
            <span className="px-5 py-2 border border-zinc-800 text-zinc-600 rounded-lg cursor-not-allowed">
              &larr; Prev
            </span>
          )}

          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={getPageLink(page + 1)}
              className="px-5 py-2 border border-zinc-700 rounded-lg hover:border-emerald-500 transition"
            >
              Next &rarr;
            </Link>
          ) : (
            <span className="px-5 py-2 border border-zinc-800 text-zinc-600 rounded-lg cursor-not-allowed">
              Next &rarr;
            </span>
          )}
        </div>
      )}
    </section>
  );
}
