import Button from "@/components/ui/Button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function LocalExperiencesAiCta() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-black/5 bg-[#2c6e9b]/5 p-6 sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#2c6e9b] shadow-sm">
          <SparklesIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text)]">
            Want a personalized experience?
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Let our AI Trip Planner create the perfect local experience
            itinerary for you.
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
  );
}
