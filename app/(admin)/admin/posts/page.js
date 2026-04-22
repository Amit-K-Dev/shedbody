"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Plus,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AllPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Delete Modal States
  const [postToDelete, setPostToDelete] = useState(null); // Jis post ko delete karna hai uski ID yahan aayegi
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("id", { ascending: false });

      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Not Published";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postToDelete);

    if (error) {
      toast.error("Failed to delete post: " + error.message);
    } else {
      setPosts(posts.filter((post) => post.id !== postToDelete));

      toast.success("Post deleted permanently!");
    }

    setIsDeleting(false);
    setPostToDelete(null);
  };

  const filteredPosts = posts.filter((post) => {
    const safeStatus = (post.status || "draft").toString().trim().toLowerCase();
    if (filter === "all") return true;
    if (filter === "published") return safeStatus === "published";
    if (filter === "draft") return safeStatus !== "published";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">All Articles</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your blog content and drafts.
          </p>
        </div>
        <Link
          href="/admin/new-post"
          className="flex items-center gap-2 bg-emerald-600 px-5 py-2.5 rounded-lg text-white font-medium hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} /> New Post
        </Link>
      </div>

      <div className="flex gap-6 border-b border-zinc-800 mb-6 px-2">
        {["all", "published", "draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-sm font-medium transition-all relative capitalize ${
              filter === f
                ? f === "draft"
                  ? "text-amber-400"
                  : "text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {f === "all" ? "All Posts" : f}
            {f === "draft" && (
              <span className="ml-2 bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full">
                {
                  posts.filter(
                    (p) => (p.status || "draft").toLowerCase() !== "published",
                  ).length
                }
              </span>
            )}
            {filter === f && (
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${f === "draft" ? "bg-amber-400" : "bg-emerald-400"}`}
              ></span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredPosts.map((post) => {
                const safeStatus = (post.status || "draft")
                  .toString()
                  .trim()
                  .toLowerCase();
                const isPublished = safeStatus === "published";
                const displayDate = formatDate(
                  post.published_at || post.updated_at,
                );

                return (
                  <tr
                    key={post.id}
                    className="hover:bg-zinc-800/40 transition duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-emerald-400 transition">
                          <FileText size={16} />
                        </div>
                        <span className="text-zinc-100 font-medium text-sm truncate max-w-62.5 inline-block">
                          {post.title || "Untitled Masterpiece"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 text-sm bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-700/50">
                        {post.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {safeStatus === "" ? "DRAFT" : safeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-sm font-medium">
                      {displayDate}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                        title="Edit Post"
                      >
                        <Edit size={18} />
                      </Link>

                      <button
                        onClick={() => setPostToDelete(post.id)}
                        className="inline-flex p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-10 text-center text-zinc-500 animate-pulse">
            Loading posts...
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-50">
                Delete Article?
              </h3>
            </div>
            <p className="text-zinc-400 mb-6 text-sm">
              Are you sure you want to permanently delete this article? This
              action cannot be undone and it will be removed from the database
              immediately.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
