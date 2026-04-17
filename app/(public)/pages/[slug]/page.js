import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const supabase = createClient();

  const { slug } = await params;

  const cleanSlug = slug.trim().replace(/\/$/, "");

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !page) {
    console.error("Error:", error);
    return notFound();
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

      <div
        className="prose prose-invert"
        dangerouslySetInnerHTML={{
          __html: page.content,
        }}
      />
    </section>
  );
}
