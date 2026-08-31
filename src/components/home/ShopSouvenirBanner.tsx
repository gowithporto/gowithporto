"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";

import shopBanner from "@/assets/2. shop page/shop ad banner.png";
import Button from "@/components/ui/Button";

export default function ShopSouvenirBanner() {
  const { lang } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src={shopBanner}
          alt="Authentic Porto souvenirs and local treasures"
          className="h-56 w-full object-cover sm:h-80"
          priority={false}
        />
        <div className="absolute inset-y-0 left-0 flex w-full items-center bg-gradient-to-r from-white/90 via-white/60 to-transparent sm:w-3/5">
          <div className="max-w-sm px-6 sm:px-12">
            <p className="font-serif text-lg font-medium text-[var(--primary)] sm:text-xl">
              {t(lang, "home.shopBanner.eyebrow")}
            </p>
            <h3 className="font-serif text-2xl font-medium text-[var(--primary)] sm:text-3xl">
              {t(lang, "home.shopBanner.title")}{" "}
              <span className="text-[#eab657]">
                {t(lang, "home.shopBanner.titleHighlight")}
              </span>
            </h3>
            <p className="mt-3 text-sm text-[#4b5b66] sm:text-base">
              {t(lang, "home.shopBanner.subtitle")}
            </p>
            <Link href="/shop" className="mt-5 inline-block">
              <Button className="cursor-pointer">
                {t(lang, "home.shopBanner.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
