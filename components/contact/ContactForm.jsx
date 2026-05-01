"use client";

import { useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

export default function ContactForm() {
  const turnstileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      showToast("Please complete security verification.", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.target);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      inquiryType: formData.get("inquiryType"),
      message: formData.get("message"),
      honeypot: formData.get("company"),
      turnstileToken: token,
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
        showToast(
          "Message sent successfully. We'll get back to you soon.",
          "success",
        );

        e.target.reset();
        setToken("");
        turnstileRef.current?.reset();
      } else {
        showToast(
          result.error || "Something went wrong. Please try again.",
          "error",
        );
      }
    } catch {
      showToast("Network error. Please try again later.", "error");
    }

    setLoading(false);
  }

  return (
    <div className="relative">
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-9999 flex items-center px-4 py-3 rounded-lg shadow-lg text-zinc-50 text-sm font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
          }`}
        >
          <span className="mr-2 text-lg">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          className="hidden"
          tabIndex="-1"
          autoComplete="off"
        />

        <div>
          <label className="block mb-2 text-sm">Full Name</label>
          <input
            name="name"
            required
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Email Address</label>
          <input
            type="email"
            name="email"
            required
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none"
            placeholder="john@example.com"
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
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-400 outline-none resize-none"
            placeholder="How can we help you?"
          />
        </div>

        {/* Cloudflare Turnstile */}
        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setToken(token)}
            onExpire={() => setToken("")}
            options={{
              theme: "dark",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
