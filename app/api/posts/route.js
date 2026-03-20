import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, slug, category, content, excerpt, published_at, updated_at, views",
    );

  return Response.json(data);
}
