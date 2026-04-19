"use client";

import { useState } from "react";
import { faqs } from "./faqData";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-zinc-50 mb-6 text-center">
        FAQs About the Scientific Review Board
      </h2>
      <p className="mb-6">
        Here are answers to some frequently asked questions about the ShedBody
        Scientific Review Board:
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="border border-zinc-50/10 rounded-2xl bg-zinc-50/5 backdrop-blur-sm overflow-hidden transition-all hover:border-zinc-50/20"
            >
              {/* Question */}
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <h3 className="text-lg font-semibold text-zinc-50">
                  {faq.question}
                </h3>

                <span className="text-emerald-400 text-xl font-bold">
                  {isOpen ? "-" : "+"}
                </span>
              </button>

              {/* Answer */}
              <div
                className={`px-5 transition-all duration-300 ${
                  isOpen
                    ? "max-h-80 mx-auto pb-5 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <p className="text-zinc-300 leading-7">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
