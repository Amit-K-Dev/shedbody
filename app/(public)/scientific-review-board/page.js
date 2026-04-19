import ExpertSection from "./ExpertSection";
import FAQSection from "./FAQSection";
import TrustSection from "./TrustSection";

export const metadata = {
  title: "Scientific Review Board | ShedBody",
  description: "Meet the certified experts who review and ensure the accuracy of our fitness and nutrition content.",
};

export default function ScientificReviewBoardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-50 mb-6 tracking-tight">
          Scientific Review Board
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Every workout, nutrition plan, and article on ShedBody is reviewed by certified medical professionals, dietitians, and coaches to bring you evidence-based results.
        </p>
        
        {/* Trust Badges */}
        <TrustSection />
      </div>

      {/* Grid of Experts */}
      <ExpertSection />

      {/* FAQs */}
      <FAQSection />
    </div>
  );
}