"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";

import aiBanner from "@/assets/4. Ai input page/plan with ai banner ad background.png";
import Button from "@/components/ui/Button";

export default function AiTripPlannerBanner() {
  const { lang } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src={aiBanner}
          alt="Plan your Porto trip with AI"
          className="h-56 w-full object-cover sm:h-80"
          priority={false}
        />
        <div className="absolute inset-y-0 left-0 flex w-full items-center bg-gradient-to-r from-white/90 via-white/60 to-transparent sm:w-3/5">
          <div className="max-w-sm px-6 sm:px-12">
            <p className="text-lg font-medium text-[#3a4a56] sm:text-xl">
              {t(lang, "home.aiBanner.subtitle")}
            </p>
            <Link href="/ai" className="mt-6 inline-block">
              <Button className="cursor-pointer gap-2">
                <SparklesIcon className="h-4 w-4" />
                {t(lang, "home.aiBanner.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
