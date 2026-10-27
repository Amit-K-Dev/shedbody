import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function GET(request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const isD1NotificationsEnabled = process.env.ENABLE_D1_NOTIFICATIONS === "true";

  if (isD1NotificationsEnabled) {
    try {
      const { NotificationRepository } = await import("@/lib/repositories/NotificationRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const notificationRepo = new NotificationRepository(adapter);

      const notifications = await notificationRepo.getNotifications(user.id, limit);
      const unreadCount = await notificationRepo.getUnreadCount(user.id);
      
      return NextResponse.json({
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.warn("NotificationRepository D1 Error, falling back to Supabase:", error?.message || error);
      // Fall through to Supabase below
    }
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Fetch notifications
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch unread count
  const { count: unreadCount, error: countError } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  return NextResponse.json({
    notifications,
    unreadCount: unreadCount || 0,
  });
}
