"use client";

import Button from "@/components/ui/Button";
import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import { useEffect, useState } from "react";

import Link from "next/link";
import backgroundImage from "../assets/1. home page/banner2.png";
import bottomLeftLine1 from "../assets/bottom left line 1.png";
import bottomRightLine1 from "../assets/bottom right line 1.png";

import BikeRentalBanner from "@/components/home/BikeRentalBanner";
import DiscoverPorto from "@/components/home/DiscoverPorto";
import LocalFlavors from "@/components/home/LocalFlavors";
import PopularCategories from "@/components/home/PopularCategories";
import WhyChooseStayInspired from "@/components/home/WhyChooseStayInspired";

export default function Home() {
  const [show, setShow] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative flex min-h-screen items-center px-[10%]">
        {/* Background */}
        <Image
          src={backgroundImage}
          alt="Porto Hero"
          fill
          priority
          className="object-cover"
        />

        {/* Legibility scrim so text stays readable over the full-bleed artwork.
            Mobile: text overlaps the whole image width, so a uniform light overlay
            keeps the photo visible everywhere. Desktop: text sits in the left column
            only, so a left-to-right gradient keeps the right side of the photo clear. */}
        <div className="absolute inset-0 bg-[var(--bg)]/45 lg:bg-gradient-to-r lg:from-[var(--bg)] lg:via-[var(--bg)]/70 lg:to-transparent" />

        {/* Content */}
        <div
          className={`relative z-10 max-w-xl transition-all duration-1000
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h1
            className="font-serif text-[clamp(2.5rem,6vw,4rem)] font-medium text-[var(--primary)]
 leading-tight"
          >
            {t(lang, "home.title")}{" "}
            <span className="text-[#eab657]">{t(lang, "home.withai")}</span>
          </h1>

          <p className="mt-5 text-lg text-[var(--text)]">
            {t(lang, "home.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/ai" className="w-full sm:w-auto">
              <Button className="w-full cursor-pointer whitespace-nowrap sm:w-auto">
                {t(lang, "home.cta")}
              </Button>
            </Link>
            <Link href="/shop" className="w-full sm:w-auto">
              <Button
                className="w-full cursor-pointer whitespace-nowrap text-[var(--text)] sm:w-auto"
                variant="secondary"
              >
                {t(lang, "home.explore")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Azulejo — smaller on mobile so it doesn't crowd the content, full size from lg up */}
        <Image
          src={bottomLeftLine1}
          alt=""
          width={300}
          height={80}
          className="absolute bottom-0 left-0 h-auto w-28 sm:w-40 lg:w-75"
        />
        <Image
          src={bottomRightLine1}
          alt=""
          width={300}
          height={80}
          className="absolute bottom-0 right-0 h-auto w-28 sm:w-40 lg:w-75"
        />
      </section>

      <PopularCategories />
      <DiscoverPorto />
      <BikeRentalBanner />
      <LocalFlavors />
      <WhyChooseStayInspired />
    </main>
  );
}
