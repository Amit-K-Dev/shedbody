import { supabase } from "@/lib/supabase";
import PostCard from "@/components/PostCard";
import { getPostByCategory } from "@/lib/posts";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data } = await supabase.from("posts").select("category");

  const categories = [...new Set(data.map((p) => p.category))];

  return categories.map((category) => ({
    category,
  }));
}

const categoryDescriptions = {
  nutrition:
    "Evidence-based nutrition guides, healthy diet plans, strategies, and practical tips to help you build sustainable eating habits.",

  workouts:
    "Structured workout routines, strength training programs, and fitness plans designed to improve endurance, build muscle, and support overall health.",

  exercises:
    "Step-by-step exercise tutorials, for guides, and movement techniques to help you perform exercises safely and effectively.",

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

export async function generateMetadata({ params }) {
  const { category } = await params;

  const title = `${category.charAt(0).toUpperCase() + category.slice(1)} Articles`;

  const description =
    categoryDescriptions[category] ||
    `Explore evidence-based ${category.replace("-", "")} guides on ShedBody.`;

  return {
    title,
    description,
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const posts = await getPostByCategory(category);

  const filteredPosts = posts?.filter(
    (post) => post.category?.toLowerCase() === category.toLowerCase(),
  );

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold capitalize">{category}</h1>
        <p className="text-gray-300 mt-4">
          {categoryDescriptions[category] ||
            `Explore evidence-based ${category.replace(
              "-",
              "",
            )} guides on ShedBody.`}
        </p>
        <p className="text-gray-400 mt-4">No posts found.</p>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category} Articles`,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://shedbody.vercel.app/${post.category.toLowerCase()}/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold capitalize mb-4">
          {category.replace("-", "")}
        </h1>
        <p className="text-gray-300 mb-10">
          {categoryDescriptions[category] ||
            `Explore evidence-based ${category.replace(
              "-",
              "",
            )} guides on ShedBody.`}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </>
  );
}
