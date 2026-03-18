import { getAllPosts, getCategories } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Link from "next/link";

// Dynamic SEO metadata
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;

  const category = params?.category || null;
  const page = parseInt(params?.page || "1");

  const baseUrl = "https://shedbody.vercel.app";

  const url = `${baseUrl}/articles${
    category ? `?category=${category}` : ""
  }${page > 1 ? `${category ? "&" : "?"}page=${page}` : ""}`;

  return {
    title: "All Articles",
    description:
      "Explore all fitness, nutrition, yoga, and workout articles on ShedBody.",
    alternates: {
      canonical: url,
    },
  };
}

export default async function ArticlesPage({ searchParams }) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = 9;

  const { posts, total } = await getAllPosts(null, page, limit);
  const categories = await getCategories();

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">All Articles</h1>

      <p className="text-gray-400 mb-10">
        Explore all fitness, nutrition, yoga, workout guides.
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={cat === "all" ? "/articles" : `${cat}`}
            className="px-4 py-2 rounded-full border text-gray-300 border-gray-600"
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Link>
        ))}
      </div>

      {/* Posts Grip */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination Numbers */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        {page > 1 && (
          <Link href={`/articles?page=${page - 1}`}>&larr; Prev</Link>
        )}
        {page < totalPages && (
          <Link href={`/articles?page=${page + 1}`}>Next &rarr;</Link>
        )}
      </div>
    </main>
  );
}
