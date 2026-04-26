// Helper Extractors for SEO Schema Fallbacks
function getPostImage(post) {
  if (post.featured_image || post.image)
    return post.featured_image || post.image;
  if (post.content) {
    const htmlImg = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlImg && htmlImg[1]) return htmlImg[1];
    const mdImg = post.content.match(/!\[.*?\]\((.*?)\)/i);
    if (mdImg && mdImg[1]) return mdImg[1];
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
    keywords: post.keywords ? post.keywords : undefined,
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
