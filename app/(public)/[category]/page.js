import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

import { getCategoriesForBuild, getAllPosts } from "@/lib/posts";
import SortFilter from "@/components/SortFilter";
import SearchBar from "@/components/SearchBar";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getCategoriesForBuild();

  const validCategories = categories.filter((c) => c !== "all");

  return validCategories.map((category) => ({
    category,
  }));
}

const categoryDescriptions = {
  nutrition:
    "Evidence-based nutrition guides, healthy diet plans, strategies, and practical tips to help you build sustainable eating habits.",
  workouts:
    "Structured workout routines, strength training programs, and fitness plans designed to improve endurance, build muscle, and support overall health.",
  exercises:
    "Step-by-step exercise tutorials, form guides, and movement techniques to help you perform exercises safely and effectively.",
  yoga: "Yoga poses, flexibility routines, breathing techniques, and mindfulness practices to improve balance, mobility, and mental well-being.",
  fitness:
    "Comprehensive fitness advice including training strategies, strength building, conditioning, and lifestyle habits for long-term health.",
  health:
    "Science-backed health information, wellness strategies, recovery tips, and lifestyle guidance to support a healthier life.",
  recipes:
    "Healthy recipes, nutritious meal ideas, and balanced cooking guides designed to support fitness, weight management, and overall wellness.",
  beauty:
    "Natural beauty tips, skincare guidance, and wellness routines to help maintain healthy skin and enhance personal care.",
  product:
    "Detailed product reviews, fitness gear recommendations, and wellness tools to help you choose the best products for your health journey.",
};

// Helper function to format category names
function formatCategoryName(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { category } = await params;

  // ✅ Fixed formatting
  const formattedCategory = formatCategoryName(category);
  const title = `${formattedCategory} Articles`;
  const description =
    categoryDescriptions[category] ||
    `Explore evidence-based ${formattedCategory} guides on ShedBody.`;

  return {
    title,
    description,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;

  const page = parseInt(resolvedSearchParams?.page || "1");
  const sort = resolvedSearchParams?.sort || "latest";
  const search = resolvedSearchParams?.search || "";
  const limit = 9;

  const formattedCategory = formatCategoryName(category);
  const baseUrl = "https://shedbody.com";

  const { posts, total } = await getAllPosts(
    category,
    page,
    limit,
    sort,
    search,
  );

  const filteredPosts = posts || [];
  const totalPages = Math.ceil(total / limit);

  if (!filteredPosts.length && !search) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold">{formattedCategory}</h1>
        <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
          {categoryDescriptions[category] ||
            `Explore evidence-based ${formattedCategory} guides on ShedBody.`}
        </p>
        <p className="text-zinc-500 mt-8 text-lg">
          No posts published in this category yet.
        </p>
      </div>
    );
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: formattedCategory,
        item: `${baseUrl}/${category}`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${formattedCategory} Articles`,
    itemListElement: filteredPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/${post.category}/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">{formattedCategory}</h1>
        <p className="text-zinc-300 mb-10 max-w-3xl">
          {categoryDescriptions[category] ||
            `Explore evidence-based ${formattedCategory} guides on ShedBody.`}
        </p>

        {/* Search Bar */}
        <SearchBar category={category} />

        {/* Sort Filter */}
        <SortFilter
          category={category}
          currentSort={sort}
          currentSearch={search}
        />

        {/* Empty Search Result */}
        {!filteredPosts.length && search ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-zinc-300">
              No results found for "
              <span className="text-emerald-400">{search}</span>"
            </h2>
            <p className="text-zinc-500 mt-4">
              Try checking for typos or searching a different term.
            </p>
          </div>
        ) : (
          <>
            {/* Post Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} search={search} />
              ))}
            </div>

            <Pagination
              category={category}
              page={page}
              totalPages={totalPages}
              sort={sort}
              search={search}
            />
          </>
        )}
      </section>
    </>
  );
}
