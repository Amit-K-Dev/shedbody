import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(authContext) {
  const supabase = authContext?.supabase || (await createClient());
  let userId = authContext?.userId;

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userId = user?.id;
  }

  if (!userId) return null;

  const { data, error } = await supabase
    .from("calculator_results")
    .select("created_at, result_data")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Get dashboard data error:", error);
    return null;
  }

  // Extract BMI values
  const bmiLogs = data
    .filter((item) => item.result_data?.bmi)
    .map((item) => ({
      bmi: item.result_data.bmi,
      category: item.result_data.category,
      date: item.created_at,
    }));

  const latest = bmiLogs[0];

  return {
    totalLogs: data.length,
    latestBMI: latest?.bmi || null,
    latestCategory: latest?.category || null,
    bmiLogs,
  };
}
