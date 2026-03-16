import Link from "next/link";

export default function PostCard({ post }) {
  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-green-500 transition"
    >
      <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>

      <p className="text-zinc-400 text-sm mb-2">{post.excerpt}</p>

      <span className="text-xs text-zinc-500">
        {new Date(post.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    </Link>
  );
}
