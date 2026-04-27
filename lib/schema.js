import { normalizeImageUrl } from "@/lib/utils/imageUrl";

// Helper Extractors for SEO Schema Fallbacks
function getPostImage(post) {
  if (post.featured_image || post.image)
    return normalizeImageUrl(post.featured_image || post.image);
  if (post.content) {
    const htmlImg = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlImg && htmlImg[1]) return normalizeImageUrl(htmlImg[1]);
    const mdImg = post.content.match(/!\[.*?\]\((.*?)\)/i);
    if (mdImg && mdImg[1]) return normalizeImageUrl(mdImg[1]);
  }
  return "/og-image.png";
}

// SMART FALLBACK: SEO Desc -> Manual Excerpt -> Content
function getPostExcerpt(post) {
  if (post.seo_desc && post.seo_desc.trim() !== "") return post.seo_desc;
  if (post.excerpt && post.excerpt.trim() !== "") return post.excerpt;

  if (post.content) {
    const pMatch = post.content.match(/<p[^>]*>(.*?)<\/p>/i);
    const rawText =
      pMatch && pMatch[1] ? pMatch[1] : post.content.substring(0, 160);
    const cleanText = rawText.replace(/<[^>]+>/g, "").trim();
    return cleanText.length > 150
      ? cleanText.substring(0, 150) + "..."
      : cleanText;
  }
  return "Evidence-based workouts, fat loss strategies, and nutrition guides on ShedBody.";
}

// SMART TITLE: SEO Title -> H1 -> Title
function getPostTitle(post) {
  if (post.seo_title && post.seo_title.trim() !== "") return post.seo_title;
  if (post.title && post.title.trim() !== "") return post.title;
  if (post.content) {
    const h1Match = post.content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) return h1Match[1].replace(/<[^>]+>/g, "").trim();
  }
  return "ShedBody Fitness Article";
}

function getPostKeywords(post) {
  if (typeof post.keywords === "string") {
    return post.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (Array.isArray(post.keywords)) {
    return post.keywords
      .map((keyword) => (typeof keyword === "string" ? keyword.trim() : ""))
      .filter(Boolean)
      .join(", ");
  }

  return undefined;
}

// Organization Schema
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShedBody",
    url: "https://shedbody.com",
    logo: "https://shedbody.com/shedbody-logo-black.png",
    sameAs: [
      "https://youtube.com/@shed-body",
      "https://linkedin.com/company/shedbody",
      "https://facebook.com/shedbody",
      "https://instagram.com/shedbody_",
      "https://pinterest.com/shedbody",
      "https://twitter.com/shedbody",
    ],
  };
}

// Person (Expert) Schema
export function getPersonSchema(expert) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: expert.name,
    jobTitle: expert.role,
    image: expert.image?.startsWith("http")
      ? expert.image
      : `https://shedbody.com${expert.image}`,
    sameAs: expert.sameAs || [],
    alumniOf: { "@type": "CollegeOrUniversity", name: expert.alumniOf },
    knowsAbout: expert.specialty?.split(",") || [],
    description: `${expert.name} is a ${expert.role} with ${expert.experience}. Specialized in ${expert.specialty}.`,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional Certification",
      recognizedBy: { "@type": "Organization", name: expert.credentials },
    },
  };
}

// Table of Contents Schema
export function getTableOfContentsSchema(headings, postUrl, title) {
  if (!Array.isArray(headings) || headings.length === 0 || !postUrl) {
    return null;
  }

  const itemListElement = headings
    .flatMap((heading) => [heading, ...(heading.items || [])])
    .filter((heading) => heading?.id && heading?.text)
    .map((heading, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: heading.text,
      url: `${postUrl}#${heading.id}`,
    }));

  if (itemListElement.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title ? `${title} table of contents` : "Article table of contents",
    itemListElement,
  };
}

// Article Table Schema
export function getArticleTableSchemas(tables, postUrl) {
  if (!Array.isArray(tables) || tables.length === 0 || !postUrl) {
    return [];
  }

  return tables
    .filter((table) => table?.id && table?.name)
    .map((table) => ({
      "@type": "Table",
      "@id": `${postUrl}#${table.id}`,
      name: table.name,
      url: `${postUrl}#${table.id}`,
      cssSelector: `#${table.id}`,
      ...(table.description ? { description: table.description } : {}),
      ...(table.text ? { text: table.text } : {}),
    }));
}

// Blog Post Schema
export function getArticleSchema(post, expert = null) {
  const baseUrl = "https://shedbody.com";
  // Safe Category URL
  const safeCategory = post.category
    ? post.category.toLowerCase().replace(/\s+/g, "-")
    : "general";
  const postUrl = `${baseUrl}/${safeCategory}/${post.slug}`;

  const safeTitle = getPostTitle(post);
  const safeDescription = getPostExcerpt(post);
  const rawImage = getPostImage(post);
  const absoluteImageUrl = rawImage.startsWith("http")
    ? rawImage
    : `${baseUrl}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: safeTitle,
    description: safeDescription,
    image: [absoluteImageUrl],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    keywords: getPostKeywords(post),
    author: {
      "@type": "Organization",
      name: "ShedBody",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "ShedBody",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/shedbody-logo-black.png`,
      },
    },
  };

  if (expert) {
    schema.reviewedBy = {
      "@type": "Person",
      name: expert.name,
      url: `${baseUrl}/experts/${expert.id}`,
    };
  }

  return schema;
}
