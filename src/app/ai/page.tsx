import AIInfoStrip from "@/components/ai/AIInfoStrip";
import AIInspiredCarousel from "@/components/ai/AIInspiredCarousel";
import AIPlannerForm from "@/components/ai/AIPlannerForm";
import AIPlannerHero from "@/components/ai/AIPlannerHero";
import AIReviewBanner from "@/components/ai/AIReviewBanner";

export default function AIFormPage() {
  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr]">
        <AIPlannerHero />
        <AIPlannerForm />
      </div>

      <div className="mx-auto max-w-6xl">
        <AIInfoStrip />
      </div>

      <AIInspiredCarousel />

      <AIReviewBanner />
    </div>
  );
}
