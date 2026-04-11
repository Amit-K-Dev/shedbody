"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ postId }) {
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!postId || hasFetched.current) return;

    const key = `viewed_post_${postId}`;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const { time } = JSON.parse(stored);
        const THIRTY_MIN = 30 * 60 * 1000;

        if (Date.now() - time < THIRTY_MIN) {
          return;
        }
      }
    } catch (e) {
      console.warn("ViewTracker localStorage parse error:", e);

      localStorage.removeItem(key);
    }

    const increment = async () => {
      hasFetched.current = true;

      try {
        const res = await fetch("/api/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ postId }),
        });

        if (res.ok) {
          localStorage.setItem(key, JSON.stringify({ time: Date.now() }));
        } else {
          hasFetched.current = false;
        }
      } catch (err) {
        console.error("View fetch error:", err);
        hasFetched.current = false;
      }
    };

    increment();
  }, [postId]);

  return null;
}
