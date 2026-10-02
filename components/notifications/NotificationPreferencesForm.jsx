"use client";

import { useState } from "react";
import { Bell, Activity, Target, Flame, Calendar, BookOpen } from "lucide-react";

export default function NotificationPreferencesForm({ initialPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences || {
    workout_reminders: true,
    goal_reminders: true,
    habit_reminders: true,
    weekly_progress: true,
    plan_updates: true,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setSaving(false);
    }
  };

  const Switch = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
        checked ? "bg-emerald-500" : "bg-zinc-700"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden p-1">
        <div className="p-5 border-b border-zinc-800/50 flex items-center gap-3">
          <Bell className="text-emerald-400" size={20} />
          <h2 className="text-lg font-bold text-zinc-100">Notification Preferences</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Activity className="text-blue-400 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-zinc-100 text-sm">Workout Reminders</p>
                <p className="text-xs text-zinc-400 mt-0.5">Get notified when you miss a workout for 3 days.</p>
              </div>
            </div>
            <Switch checked={preferences.workout_reminders} onChange={() => handleChange("workout_reminders")} />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Target className="text-purple-400 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-zinc-100 text-sm">Goal Reminders</p>
                <p className="text-xs text-zinc-400 mt-0.5">Stay on track with your active weight goals.</p>
              </div>
            </div>
            <Switch checked={preferences.goal_reminders} onChange={() => handleChange("goal_reminders")} />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Flame className="text-orange-400 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-zinc-100 text-sm">Habit Reminders</p>
                <p className="text-xs text-zinc-400 mt-0.5">Daily nudges to keep your streaks alive.</p>
              </div>
            </div>
            <Switch checked={preferences.habit_reminders} onChange={() => handleChange("habit_reminders")} />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Calendar className="text-emerald-400 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-zinc-100 text-sm">Weekly Progress</p>
                <p className="text-xs text-zinc-400 mt-0.5">Receive a summary of your week&apos;s achievements.</p>
              </div>
            </div>
            <Switch checked={preferences.weekly_progress} onChange={() => handleChange("weekly_progress")} />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <BookOpen className="text-amber-400 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-zinc-100 text-sm">Plan Updates</p>
                <p className="text-xs text-zinc-400 mt-0.5">Important updates regarding your current plans.</p>
              </div>
            </div>
            <Switch checked={preferences.plan_updates} onChange={() => handleChange("plan_updates")} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {success && <span className="text-sm font-medium text-emerald-400">Preferences saved!</span>}
        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
}
