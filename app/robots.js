export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/plans",
        "/start",
        "/profile",
        "/api/",
        "/_next/",
      ],
    },
    sitemap: "https://shedbody.com/sitemap.xml",
  };
}
