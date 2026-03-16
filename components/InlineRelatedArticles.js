import Link from "next/link";

export default function InlineRelatedArticle({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-16 border border-zinc-800 rounded-xl p-6 bg-zinc-900/40">
      <p className="text-lg font-semibold mb-4 text-white">You may also like</p>

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`${post.category}/${post.slug}`}
              className="text-green-400 hover:text-green-300 transition"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
