"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReminderSettings({ initial }) {
  const [enabled, setEnabled] = useState(initial?.enabled);
  const [time, setTime] = useState(initial?.time);

  const supabase = createClient();

  const save = async () => {
    const { data } = await supabase.auth.getUser();

    await supabase
      .from("user_profiles")
      .update({
        reminder_enabled: enabled,
        reminder_time: time,
      })
      .eq("user_id", data.user.id);

    alert("Saved");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="mb-4 font-semibold text-zinc-50">Reminders</h3>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        Enable reminders
      </label>

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full p-2 bg-zinc-800 rounded mb-4"
      />

      <button
        onClick={save}
        className="bg-emerald-500 text-black px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
