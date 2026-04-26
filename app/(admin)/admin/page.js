import Link from "next/link";
import {
  FileText,
  Eye,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Edit3,
  BarChart3,
  Flame,
  Activity,
} from "lucide-react";

import {
  getAdminStats,
  getAdminRecentPosts,
  getAdminTopPosts,
} from "@/lib/posts";

export const revalidate = 300;

export default async function AdminDashboard() {
  const { totalPosts, totalViews, avgViews } = await getAdminStats();
  const recentPosts = await getAdminRecentPosts(5);
  const topPosts = await getAdminTopPosts(5);

  const calculateTrendingScore = (views, publishedDate) => {
    if (!views || !publishedDate) return 0;
    const daysAlive = Math.max(
      1,
      Math.floor(
        (new Date() - new Date(publishedDate)) / (1000 * 60 * 60 * 24),
      ),
    );
    return (views / daysAlive).toFixed(1);
  };

  // UI
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 mb-1">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-zinc-400 text-sm">
            Here is your ShedBody traffic and SEO overview.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-semibold transition flex-1 sm:flex-none border border-zinc-700"
          >
            <ExternalLink size={16} /> View Site
          </Link>
          <Link
            href="/admin/new-post"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition flex-1 sm:flex-none shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle size={18} /> New Post
          </Link>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
            <FileText className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Total Articles
            </p>
            <h3 className="text-3xl font-bold text-zinc-100">{totalPosts}</h3>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Eye className="text-emerald-500" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Total Page Views
            </p>
            <h3 className="text-3xl font-bold text-zinc-100">
              {totalViews.toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0 border border-purple-500/20">
            <TrendingUp className="text-purple-500" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Avg. Views/Post
            </p>
            <h3 className="text-3xl font-bold text-zinc-100">
              {avgViews.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT FOR TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Top Performing Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <Flame
                className="text-orange-500"
                size={20}
                fill="currentColor"
              />
              <h2 className="text-lg font-bold text-zinc-100">
                Top Performing (SEO & Traffic)
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Article</th>
                  <th className="px-6 py-4 font-semibold">Total Views</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Velocity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {topPosts && topPosts.length > 0 ? (
                  topPosts.map((post, index) => {
                    const velocity = calculateTrendingScore(
                      post.views,
                      post.published_at,
                    );
                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-zinc-800/30 transition group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <span
                              className={`font-bold mt-0.5 ${index === 0 ? "text-amber-400" : index === 1 ? "text-zinc-300" : index === 2 ? "text-amber-700" : "text-zinc-600"}`}
                            >
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-zinc-200 line-clamp-1 group-hover:text-emerald-400 transition">
                                {post.title}
                              </p>
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 mt-1 inline-block uppercase tracking-wider">
                                {post.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-200">
                          {post.views?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-bold"
                            title="Average views per day since published"
                          >
                            <Activity size={12} /> {velocity}/day
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      No traffic data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Recently Added Posts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-emerald-500" size={20} />
              <h2 className="text-lg font-bold text-zinc-100">
                Recently Added
              </h2>
            </div>
            <Link
              href="/admin/posts"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Article</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-zinc-800/30 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-200 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(
                            post.published_at || post.updated_at,
                          ).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 w-fit ${post.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${post.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`}
                          ></div>
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition text-xs font-medium"
                        >
                          <Edit3 size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      No posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
