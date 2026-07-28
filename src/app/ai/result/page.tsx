"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import ItineraryOverview from "@/components/ai-result/ItineraryOverview";
import ResultHero from "@/components/ai-result/ResultHero";
import ResultInfoStrip from "@/components/ai-result/ResultInfoStrip";
import ResultReviewBanner from "@/components/ai-result/ResultReviewBanner";
import ResultSidebar from "@/components/ai-result/ResultSidebar";

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No plan ID provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/ai/result?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch travel plan");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="animate-pulse p-20 text-center font-serif text-xl text-[var(--primary)]">
        Reading the stars for your trip...
      </div>
    );
  if (error)
    return (
      <div className="p-20 text-center font-serif text-red-500">{error}</div>
    );
  if (!data)
    return <div className="p-20 text-center font-serif">Plan not found.</div>;

  const { response, prompt } = data;
  const days = Number(prompt.days) || response.itinerary?.length || 1;

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <ResultHero
          days={days}
          budget={prompt.budget}
          people={prompt.people}
          dates={prompt.dates}
        />

        <ResultInfoStrip />

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <ItineraryOverview itinerary={response.itinerary ?? []} />
          <ResultSidebar
            days={days}
            budget={prompt.budget}
            people={prompt.people}
            dates={prompt.dates}
          />
        </div>

        <ResultReviewBanner />
      </div>
    </div>
  );
}

export default function AIResultPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center font-serif text-[var(--primary)]">
          Loading Result...
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
