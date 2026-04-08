import { createClient } from "@/lib/supabase/server";
import { updateStreak } from "@/lib/streak/updateStreak";

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const streak = await updateStreak(user.id);

  return Response.json({
    success: true,
    streak,
  });
}
