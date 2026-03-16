export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://shedbody.vercel.app/sitemap.xml",
  };
}
