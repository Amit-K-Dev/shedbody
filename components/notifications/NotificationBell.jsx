"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const markAsRead = async (id, actionUrl) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (actionUrl) {
        setOpen(false);
        router.push(actionUrl);
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const toggleDropdown = () => {
    if (!open) {
      fetchNotifications();
    }
    setOpen(!open);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
            <h3 className="font-bold text-zinc-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-zinc-900">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell size={32} className="text-zinc-700 mb-3" />
                <p className="text-zinc-400 text-sm">No notifications yet.</p>
                <p className="text-zinc-600 text-xs mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id, notif.action_url)}
                  className={`p-3 rounded-lg flex gap-3 cursor-pointer transition ${
                    notif.is_read
                      ? "hover:bg-zinc-800/50"
                      : "bg-emerald-500/5 hover:bg-emerald-500/10"
                  }`}
                >
                  <div className="mt-1">
                    {!notif.is_read ? (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-zinc-700 mt-1.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-semibold ${
                        notif.is_read ? "text-zinc-300" : "text-emerald-400"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-600 mt-2 block font-medium">
                      {new Date(notif.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
