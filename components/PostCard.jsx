import Link from "next/link";
import { formatPostDate } from "@/lib/utils/date";

function HighlightedText({ text, query }) {
  if (!query) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-400 text-black px-1 rounded-sm"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export default function PostCard({ post, search = "" }) {
  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500 transition"
      prefetch={false}
    >
      <h2 className="text-xl font-semibold text-white mb-2">
        <HighlightedText text={post.title} query={search} />
      </h2>

      <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{post.excerpt}</p>

      <p className="flex items-center text-xs text-zinc-500">
        <span>
          {formatPostDate(post.updated_at || post.published_at, {
            showUpdatedLable: true,
            isUpdated: !!post.updated_at,
          })}
        </span>

        <span className="mx-2">&bull;</span>

        <span>
          {post.views || 0} view{post.views !== 1 ? "s" : ""}
        </span>
      </p>
    </Link>
  );
}
