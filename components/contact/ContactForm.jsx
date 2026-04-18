"use client";

import { useState } from "react";
import Script from "next/script";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    // Generate reCAPTCHA v3 token
    let token = "";
    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (typeof window !== "undefined" && window.grecaptcha) {
        token = await new Promise((resolve) => {
          window.grecaptcha.ready(async () => {
            const currentToken = await window.grecaptcha.execute(siteKey, {
              action: "contact_submit",
            });
            resolve(currentToken);
          });
        });
      }
    } catch (err) {
      console.error("reCAPTCHA Error:", err);
    }

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      inquiryType: formData.get("inquiryType"),
      message: formData.get("message"),
      honeypot: formData.get("company"), // hidden field
      recaptchaToken: token, // Send token to backend
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
      {/* Hide the floating reCAPTCHA badge */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .grecaptcha-badge { visibility: hidden !important; }
      `,
        }}
      />

      {/* Load Google reCAPTCHA v3 script safely in the background */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
      />

      {/* Custom Toaster UI */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-9999 flex items-center px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>

        {/* Google reCAPTCHA Official Legal Disclaimer */}
        <p className="mt-4 text-xs text-center text-zinc-500">
          This site is protected by reCAPTCHA and the Google{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-400 hover:underline transition"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-400 hover:underline transition"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      </form>
    </div>
  );
}
