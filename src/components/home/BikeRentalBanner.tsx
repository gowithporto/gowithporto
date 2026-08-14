"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";

import bikeBanner from "@/assets/1. home page/rent bike banner section photo.png";
import Button from "@/components/ui/Button";

export default function BikeRentalBanner() {
  const { lang } = useLanguage();

  return (
    <section id="bike-rental" className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src={bikeBanner}
          alt="Rent a bike and explore Porto"
          className="h-56 w-full object-cover sm:h-80"
          priority={false}
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-white/90 via-white/60 to-transparent">
          <div className="max-w-sm px-6 sm:px-12">
            <h3 className="font-serif text-2xl font-medium text-[var(--primary)] sm:text-3xl">
              {t(lang, "home.bikeBanner.title")}
            </h3>
            <p className="mt-3 text-sm text-[#4b5b66] sm:text-base">
              {t(lang, "home.bikeBanner.subtitle")}
            </p>
            <Link href="/bike-rentals" className="mt-5 inline-block">
              <Button className="cursor-pointer">{t(lang, "home.bikeBanner.cta")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
