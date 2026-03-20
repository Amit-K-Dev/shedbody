"use client";

import { useEffect } from "react";

export default function ViewTracker({ postId }) {
  useEffect(() => {
    if (!postId) return;

    const key = `viewed_post_${postId}`;

    const stored = localStorage.getItem(key);

    if (stored) {
      const { time } = JSON.parse(stored);
      const THIRTY_MIN = 30 * 60 * 1000;

      if (Date.now() - time < THIRTY_MIN) {
        return; // block within 30 mins
      }
    }

    const increment = async () => {
      try {
        const res = await fetch("/api/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: Number(postId) }),
        });
        if (res.ok) {
          localStorage.setItem(key, JSON.stringify({ time: Date.now() }));
        } else {
          console.error("View API failed");
        }
      } catch (err) {
        console.error("View fetch error:", err);
      }
    };

    increment();
  }, [postId]);
  return null;
}
