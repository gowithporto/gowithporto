"use client";

import { t } from "@/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";

import img1 from "@/assets/1. home page/discover_porto/1.png";
import img10 from "@/assets/1. home page/discover_porto/10.png";
import img2 from "@/assets/1. home page/discover_porto/2.png";
import img3 from "@/assets/1. home page/discover_porto/3.png";
import img4 from "@/assets/1. home page/discover_porto/4.png";
import img5 from "@/assets/1. home page/discover_porto/5.png";
import img6 from "@/assets/1. home page/discover_porto/6.png";
import img7 from "@/assets/1. home page/discover_porto/7.png";
import img8 from "@/assets/1. home page/discover_porto/8.png";
import img9 from "@/assets/1. home page/discover_porto/9.png";
import centerLine from "@/assets/center line 3.png";

import Carousel from "./Carousel";

const PLACES = [
  { image: img1, captionKey: "home.discoverPorto.caption.ribeira" },
  { image: img2, captionKey: "home.discoverPorto.caption.clerigos" },
  { image: img3, captionKey: "home.discoverPorto.caption.carmo" },
  { image: img4, captionKey: "home.discoverPorto.caption.beaches" },
  { image: img5, captionKey: "home.discoverPorto.caption.bridge" },
  { image: img6, captionKey: "home.discoverPorto.caption.streets" },
  { image: img7, captionKey: "home.discoverPorto.caption.riverside" },
  { image: img8, captionKey: "home.discoverPorto.caption.landmarks" },
  { image: img9, captionKey: "home.discoverPorto.caption.cellars" },
  { image: img10, captionKey: "home.discoverPorto.caption.scenic" },
];

export default function DiscoverPorto() {
  const { lang } = useLanguage();

  return (
    <section
      id="discover-porto"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10"
    >
      <h2 className="text-center font-serif text-3xl font-medium text-[var(--primary)]">
        {t(lang, "home.discoverPorto.heading")}
      </h2>
      <Image
        src={centerLine}
        alt=""
        className="mx-auto mt-3 h-auto w-40 sm:w-56"
      />

      <div className="mt-10">
        <Carousel itemClassName="w-40 sm:w-48">
          {PLACES.map((place, i) => (
            <div key={i} className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src={place.image}
                alt={t(lang, place.captionKey)}
                className="h-56 w-full object-cover transition duration-300 hover:scale-105 sm:h-64"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
