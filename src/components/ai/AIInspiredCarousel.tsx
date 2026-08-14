"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

import historic from "@/assets/1. home page/discover_porto/1.png";
import romantic from "@/assets/1. home page/discover_porto/9.png";
import adventure from "@/assets/1. home page/discover_porto/4.png";
import foodie from "@/assets/1. home page/local flavor of porto/6.png";
import centerLine from "@/assets/center line 3.png";

import Carousel from "@/components/home/Carousel";

const INSPIRATIONS = [
  { image: historic, titleKey: "ai.inspired.historic.title", subtitleKey: "ai.inspired.historic.subtitle" },
  { image: foodie, titleKey: "ai.inspired.foodie.title", subtitleKey: "ai.inspired.foodie.subtitle" },
  { image: adventure, titleKey: "ai.inspired.adventure.title", subtitleKey: "ai.inspired.adventure.subtitle" },
  { image: romantic, titleKey: "ai.inspired.romantic.title", subtitleKey: "ai.inspired.romantic.subtitle" },
];

export default function AIInspiredCarousel() {
  const { lang } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        {t(lang, "ai.inspired.heading")}
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10">
        <Carousel itemClassName="w-56 sm:w-64">
          {INSPIRATIONS.map((item) => {
            const title = t(lang, item.titleKey);
            return (
              <div key={item.titleKey}>
                <div className="overflow-hidden rounded-2xl shadow-sm">
                  <Image
                    src={item.image}
                    alt={title}
                    className="h-44 w-full object-cover transition duration-300 hover:scale-105 sm:h-52"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                  {title}
                </p>
                <p className="text-xs text-gray-500">{t(lang, item.subtitleKey)}</p>
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
