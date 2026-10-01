"use client";

import { useEffect, useRef } from "react";

export default function NotificationSync() {
  const hasSynced = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls during React strict mode double-invocations
    if (hasSynced.current) return;
    hasSynced.current = true;

    // Run silently in the background
    const syncNotifications = async () => {
      try {
        await fetch("/api/notifications/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        // Silently swallow errors on client to not disrupt user experience
        console.error("Notification sync failed silently");
      }
    };

    // Add a small delay so it doesn't compete with high priority dashboard rendering fetches
    const timer = setTimeout(syncNotifications, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Renders nothing visible
  return null;
}
