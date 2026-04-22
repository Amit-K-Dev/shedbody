import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-zinc-50 mb-8">Overview</h1>

      {/* Stats Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-400 text-sm font-medium">Total Articles</h3>
          <p className="text-4xl font-bold text-zinc-50 mt-2">0</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-400 text-sm font-medium">Published</h3>
          <p className="text-4xl font-bold text-emerald-400 mt-2">0</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-400 text-sm font-medium">Drafts</h3>
          <p className="text-4xl font-bold text-amber-400 mt-2">0</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-zinc-300 mb-2">
          Welcome to ShedBody CMS
        </h2>
        <p className="text-zinc-500 mb-6">
          Start writing your first article or manage existing content.
        </p>
        <Link
          href="/admin/new-post"
          className="inline-block px-6 py-3 bg-emerald-500 text-zinc-950 font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          Create New Post
        </Link>
      </div>
    </div>
  );
}
