"use client";

import Image from "next/image";
import { useState } from "react";

import bottomBannerAd from "@/assets/8. ai credit transactions page/bottom banner ad.png";
import Button from "@/components/ui/Button";

export default function BuyCreditsCTA() {
  const [loading, setLoading] = useState(false);

  async function handleBuyCredits() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/ai-credits", { method: "POST" });
      if (!res.ok) throw new Error("Unable to start payment");
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      alert("Unable to start payment. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-black/5 bg-[#eaf3fa]">
      <Image src={bottomBannerAd} alt="" fill className="object-cover" />

      <div className="relative max-w-md p-8 sm:p-10">
        <h2 className="font-serif text-2xl text-[#173d5c] sm:text-3xl">
          Never Run Out of Inspiration
        </h2>
        <p className="mt-3 text-sm text-[var(--text)]">
          Get more AI Credits to unlock personalized itineraries, local tips,
          and smart travel planning.
        </p>
        <Button
          onClick={handleBuyCredits}
          disabled={loading}
          className="mt-6 cursor-pointer"
        >
          {loading ? "Redirecting…" : "Buy More Credits →"}
        </Button>
      </div>
    </section>
  );
}
