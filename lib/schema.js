// Organization Schema
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organizaation",
    name: "ShedBody",
    url: "https://shedbody.com",
    logo: "https://shedbody.com/logo.png",
    sameAS: [
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
    image: `https://shedbody.com/${expert.image}`,
    sameAs: expert.sameAs || [],

    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: expert.alumniOf,
    },

    knowsAbout: expert.specialty?.split(",") || [],

    description: `${expert.name} is a ${expert.role} with ${expert.experience}. Specialized in ${expert.specialty}.`,

    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional Certification",
      recognizedBy: {
        "@type": "Organization",
        name: expert.credentials,
      },
    },
  };
}

// Blog Post Schema
export function getArticleSchema(post, expert) {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndFitnessWebPage",

    mainEntity: {
      "@type": "HealthAndFitnessGuide",
      name: expert.title,
    },

    headline: post.title,
    description: post.excerpt,
    image: post.image,

    author: {
      "@type": "Organization",
      name: "ShedBody",
    },

    reviewedBy: {
      "@type": "Person",
      name: expert.name,
      jobTitle: expert.role,
    },

    publisher: {
      "@type": "Organization",
      name: "ShedBody",
      logo: {
        "@type": "ImageObject",
        url: "https://shedbody.com/logo.png",
      },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
  };
}
