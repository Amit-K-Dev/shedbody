"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
      const { error } = await supabase.rpc("increment_views", {
        post_id: Number(postId),
      });

      if (!error) {
        localStorage.setItem(key, JSON.stringify({ time: Date.now() })); // mark as viewed
      } else {
        console.error("View increment error");
      }
    };
    increment();
  }, [postId]);
  return null;
}
