import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("calculator_results")
    .select("*")
    .eq("user_id", user.id)
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
