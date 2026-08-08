import Button from "@/components/ui/Button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

import bgArt from "@/assets/1. home page/discover_porto/top-attraction bg.png";

export default function AttractionAiCta({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2c6e9b]/15 p-6 sm:p-8">
      <Image
        src={bgArt}
        alt=""
        fill
        className="object-cover object-right"
      />

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#2c6e9b] shadow-sm">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#2c6e9b] uppercase">
              AI Trip Planner
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[var(--primary)]">
              Plan your Porto trip around {title}
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Let our AI build a full itinerary around this attraction,
              tailored to your dates, budget and travel style.
            </p>
          </div>
        </div>
        <Link href="/ai" className="shrink-0">
          <Button className="gap-2">
            <SparklesIcon className="h-4 w-4" />
            Plan with AI
          </Button>
        </Link>
      </div>
    </div>
  );
}
