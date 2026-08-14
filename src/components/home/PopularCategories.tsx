"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";

import bicycle from "@/assets/1. home page/popular_categories/bycycle.png";
import coffeeCup from "@/assets/1. home page/popular_categories/caffeCup.png";
import camera from "@/assets/1. home page/popular_categories/camera.png";
import map from "@/assets/1. home page/popular_categories/map.png";
import shoppingBag from "@/assets/1. home page/popular_categories/shoopingBag.png";
import centerLine from "@/assets/center line 3.png";

const CATEGORIES = [
  {
    icon: camera,
    titleKey: "home.popularCategories.ai.title",
    subtitleKey: "home.popularCategories.ai.subtitle",
    href: "/ai",
  },
  {
    icon: shoppingBag,
    titleKey: "home.popularCategories.shop.title",
    subtitleKey: "home.popularCategories.shop.subtitle",
    href: "/shop",
  },
  {
    icon: map,
    titleKey: "home.popularCategories.attractions.title",
    subtitleKey: "home.popularCategories.attractions.subtitle",
    href: "/attractions",
  },
  {
    icon: bicycle,
    titleKey: "home.popularCategories.bikes.title",
    subtitleKey: "home.popularCategories.bikes.subtitle",
    href: "/bike-rentals",
  },
  {
    icon: coffeeCup,
    titleKey: "home.popularCategories.experiences.title",
    subtitleKey: "home.popularCategories.experiences.subtitle",
    href: "/local-experiences",
  },
];

export default function PopularCategories() {
  const { lang } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        {t(lang, "home.popularCategories.heading")}
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-5 sm:gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.titleKey}
            href={cat.href}
            className="group flex flex-col items-center gap-3 text-center transition hover:-translate-y-1"
          >
            <Image
              src={cat.icon}
              alt=""
              width={72}
              height={72}
              className="h-32 w-32 object-contain"
            />
            <div>
              <p className="font-medium text-[var(--text)]">{t(lang, cat.titleKey)}</p>
              <p className="mt-1 text-xs text-[var(--text)]/60">
                {t(lang, cat.subtitleKey)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
