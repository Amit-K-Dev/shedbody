export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/_next/static/"],
      disallow: [
        "/admin/",
        "/dashboard/",
        "/plans/",
        "/start/",
        "/profile/",
        "/api/",
      ],
    },
    sitemap: [
      "https://shedbody.com/sitemap.xml",
      "https://shedbody.com/news-sitemap.xml",
      "https://shedbody.com/image-sitemap.xml",
      "https://shedbody.com/rss.xml",
    ],
  };
}
