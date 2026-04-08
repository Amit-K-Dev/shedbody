import { createClient } from "@/lib/supabase/server";
import { addXP } from "@/lib/gamification/addXP";

export async function POST(req) {
  const supabase = createClient();
  const { amount } = await req.json();

  // Loggeg-in user securely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await addXP(user.id, amount);

  if (!result) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    xp: result.xp,
    level: result.level,
  });
}
