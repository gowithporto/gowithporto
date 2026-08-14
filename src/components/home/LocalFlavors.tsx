"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

import img1 from "@/assets/1. home page/local flavor of porto/1.png";
import img10 from "@/assets/1. home page/local flavor of porto/10.png";
import img11 from "@/assets/1. home page/local flavor of porto/11.png";
import img12 from "@/assets/1. home page/local flavor of porto/12.png";
import img2 from "@/assets/1. home page/local flavor of porto/2.png";
import img3 from "@/assets/1. home page/local flavor of porto/3.png";
import img4 from "@/assets/1. home page/local flavor of porto/4.png";
import img5 from "@/assets/1. home page/local flavor of porto/5.png";
import img6 from "@/assets/1. home page/local flavor of porto/6.png";
import img7 from "@/assets/1. home page/local flavor of porto/7.png";
import img8 from "@/assets/1. home page/local flavor of porto/8.png";
import img9 from "@/assets/1. home page/local flavor of porto/9.png";
import centerLine from "@/assets/center line 3.png";

import Carousel from "./Carousel";

const FLAVORS = [
  { image: img1, captionKey: "home.localFlavors.caption.francesinha" },
  { image: img2, captionKey: "home.localFlavors.caption.octopus" },
  { image: img3, captionKey: "home.localFlavors.caption.pasteis" },
  { image: img4, captionKey: "home.localFlavors.caption.grilledFish" },
  { image: img5, captionKey: "home.localFlavors.caption.cheeses" },
  { image: img6, captionKey: "home.localFlavors.caption.portWine" },
  { image: img7, captionKey: "home.localFlavors.caption.petiscos" },
  { image: img8, captionKey: "home.localFlavors.caption.seafood" },
  { image: img9, captionKey: "home.localFlavors.caption.bakery" },
  { image: img10, captionKey: "home.localFlavors.caption.tasting" },
  { image: img11, captionKey: "home.localFlavors.caption.market" },
  { image: img12, captionKey: "home.localFlavors.caption.cafe" },
];

export default function LocalFlavors() {
  const { lang } = useLanguage();

  return (
    <section
      id="local-flavors"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10"
    >
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        {t(lang, "home.localFlavors.heading")}
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10">
        <Carousel itemClassName="w-36 sm:w-44">
          {FLAVORS.map((flavor, i) => (
            <div key={i} className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={flavor.image}
                alt={t(lang, flavor.captionKey)}
                className="h-40 w-full object-cover transition duration-300 hover:scale-105 sm:h-48"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
