import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, category, excerpt, published_at");

  return Response.json(data);
}
