"use client";

import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const formData = new FormData(e.target);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      inquiryType: formData.get("inquiryType"),
      message: formData.get("message"),
      honeypot: formData.get("company"), // hidden field
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setStatus("success");
        e.target.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot */}
      <input type="text" name="company" className="hidden" />

      <div>
        <label className="block mb-2 text-sm">Full Name</label>
        <input
          name="name"
          required
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm">Email Address</label>
        <input
          type="email"
          name="email"
          required
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm">Inquiry Type</label>
        <select
          name="inquiryType"
          required
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none"
        >
          <option value="">Select an option</option>
          <option value="fat_loss_guidance">Fat Loss Guidance</option>
          <option value="muscle_gain_plan">Muscle Gain Plan</option>
          <option value="diet_nutrition_support">
            Diet & Nutrition Support
          </option>
          <option value="workout_plan_help">Workout Plan Assistance</option>
          <option value="technical_issue">Technical Issue</option>
          <option value="business_collaboration">
            Business / Collaboration
          </option>
          <option value="general_query">General Inquiry</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm">Your Message</label>
        <textarea
          name="message"
          rows="5"
          required
          className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl cursor-pointer transition"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {status === "success" && (
        <p className="text-emerald-400 text-sm">
          Message sent successfully. We'll get back to you soon.
        </p>
      )}

      {status === "error" && (
        <p className="text-red-400 text-sm">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
