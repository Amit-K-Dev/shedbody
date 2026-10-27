import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function PATCH(request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, markAll } = await request.json();

    const isD1NotificationsEnabled = process.env.ENABLE_D1_NOTIFICATIONS === "true";

    if (isD1NotificationsEnabled) {
      try {
        const { NotificationRepository } = await import("@/lib/repositories/NotificationRepository.js");
        const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
        const adapter = new D1Adapter();
        adapter._checkDb();
        const notificationRepo = new NotificationRepository(adapter);

        if (markAll) {
          await notificationRepo.markAllAsRead(user.id);
          return NextResponse.json({ success: true });
        }

        if (!id) {
          return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
        }

        await notificationRepo.markAsRead(user.id, id);
        return NextResponse.json({ success: true });
      } catch (d1Err) {
        console.warn("NotificationRepository D1 mark read error, falling back to Supabase:", d1Err?.message || d1Err);
        // Fall through to Supabase below
      }
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    if (markAll) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
