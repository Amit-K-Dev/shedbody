"use client";

import { useState } from "react";
import { updateGlobalReminderSettings } from "@/lib/actions/profile";

export default function ReminderSettings({ initial }) {
  const [enabled, setEnabled] = useState(initial?.enabled);
  const [time, setTime] = useState(initial?.time);

  const save = async () => {
    try {
      await updateGlobalReminderSettings(enabled, time);
      alert("Saved");
    } catch (error) {
      console.error(error);
      alert("Error saving reminders");
    }
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
