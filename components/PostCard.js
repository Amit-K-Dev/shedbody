import Link from "next/link";
import { formatePostDate } from "@/lib/utils/date";

function highlight(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(
    regex,
    `<mark class="bg-yellow-400 text-black">$1</mark>`,
  );
}

export default function PostCard({ post, search = "" }) {
  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-green-500 transition"
    >
      <h2
        className="text-xl font-semibold text-white mb-2"
        dangerouslySetInnerHTML={{
          __html: search ? highlight(post.title, search) : post.title,
        }}
      />

      <p className="text-zinc-400 text-sm mb-2">{post.excerpt}</p>

      <p className="text-xs text-zinc-500 mb-2">
        <span className="text-xs text-zinc-500  mr-2">
          {formatePostDate(post.updated_at || post.published_at, {
            showUpdatedLable: true,
            isUpdated: !!post.updated_at,
          })}
        </span>

        <span className="text-xs text-zinc-500 mr-2">&bull;</span>

        <span className="text-xs text-zinc-500">
          {post.views || 0} view{post.views > 1 ? "s" : ""}
        </span>
      </p>
    </Link>
  );
}
