import { createClient } from "@/lib/supabase/server";

export async function getWeightData() {
  const supabase = await createClient();

  const {
    data: { data, error },
  } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) return [];

  const { data: weights } = await supabase
    .from("progress_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return weights || [];
}
