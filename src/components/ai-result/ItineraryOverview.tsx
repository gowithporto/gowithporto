import Image, { StaticImageData } from "next/image";
import type { IconType } from "react-icons";
import {
  FaCar,
  FaConciergeBell,
  FaFish,
  FaHeart,
  FaLandmark,
  FaMoon,
  FaMountain,
  FaMusic,
  FaPalette,
  FaShip,
  FaShoppingBag,
  FaSpa,
  FaUtensils,
  FaWalking,
  FaWineBottle,
  FaWineGlassAlt,
} from "react-icons/fa";

import discover1 from "@/assets/1. home page/discover_porto/1.png";
import discover10 from "@/assets/1. home page/discover_porto/10.png";
import discover2 from "@/assets/1. home page/discover_porto/2.png";
import discover3 from "@/assets/1. home page/discover_porto/3.png";
import discover4 from "@/assets/1. home page/discover_porto/4.png";
import discover5 from "@/assets/1. home page/discover_porto/5.png";
import discover6 from "@/assets/1. home page/discover_porto/6.png";
import discover7 from "@/assets/1. home page/discover_porto/7.png";
import discover8 from "@/assets/1. home page/discover_porto/8.png";
import discover9 from "@/assets/1. home page/discover_porto/9.png";
import flavor1 from "@/assets/1. home page/local flavor of porto/1.png";
import flavor2 from "@/assets/1. home page/local flavor of porto/2.png";
import flavor3 from "@/assets/1. home page/local flavor of porto/3.png";
import flavor4 from "@/assets/1. home page/local flavor of porto/4.png";
import flavor5 from "@/assets/1. home page/local flavor of porto/5.png";
import flavor6 from "@/assets/1. home page/local flavor of porto/6.png";
import flavor7 from "@/assets/1. home page/local flavor of porto/7.png";
import flavor8 from "@/assets/1. home page/local flavor of porto/8.png";
import centerLine from "@/assets/center line 3.png";

type Day = {
  day: number;
  title: string;
  activities?: string[];
};

const IMAGE_POOL: StaticImageData[] = [
  discover1,
  flavor1,
  discover2,
  discover9,
  discover5,
  flavor6,
  discover3,
  discover6,
  discover4,
  flavor2,
  discover8,
  discover7,
  flavor4,
  discover10,
  flavor8,
  flavor3,
  discover2,
  flavor5,
  discover9,
  flavor7,
];

const TAG_SETS: { icon: IconType; label: string }[][] = [
  [
    { icon: FaLandmark, label: "Historic Sights" },
    { icon: FaWalking, label: "Walking" },
    { icon: FaShip, label: "River Cruise" },
    { icon: FaUtensils, label: "Local Cuisine" },
  ],
  [
    { icon: FaWineGlassAlt, label: "Wine Experience" },
    { icon: FaPalette, label: "Art & Culture" },
    { icon: FaMountain, label: "Scenic Views" },
    { icon: FaConciergeBell, label: "Fine Dining" },
  ],
  [
    { icon: FaCar, label: "Coastal Drive" },
    { icon: FaFish, label: "Seafood" },
    { icon: FaShoppingBag, label: "Shopping" },
    { icon: FaMusic, label: "Fado Experience" },
  ],
  [
    { icon: FaLandmark, label: "UNESCO Site" },
    { icon: FaWineBottle, label: "Wine Tasting" },
    { icon: FaMountain, label: "Scenic" },
    { icon: FaSpa, label: "Relaxation" },
  ],
];

export default function ItineraryOverview({ itinerary }: { itinerary: Day[] }) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-[var(--primary)] sm:text-3xl">
        Itinerary Overview
      </h2>
      <Image src={centerLine} alt="" className="mt-2 h-auto w-42" />

      <div className="relative mt-8">
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-[#2c6e9b]/40 sm:left-[31px]" />

        <div className="space-y-6">
          {itinerary.map((day, i) => {
            const tags = TAG_SETS[i % TAG_SETS.length];
            const images = [0, 1, 2, 3].map(
              (n) => IMAGE_POOL[(i * 4 + n) % IMAGE_POOL.length],
            );
            const isLast = i === itinerary.length - 1;

            return (
              <div key={day.day ?? i} className="relative pl-16 sm:pl-20">
                <div className="absolute left-0 top-0 flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-[#2c6e9b]/50 bg-white shadow-sm sm:h-16 sm:w-16">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                    Day
                  </span>
                  <span className="font-serif text-xl text-[#173d5c] sm:text-2xl">
                    {day.day}
                  </span>
                </div>

                <div className="rounded-2xl bg-[#ffffff] p-5 sm:p-6 shadow-lg">
                  <h3 className="font-semibold text-[#173d5c] sm:text-lg">
                    {day.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                    {tags.map(({ icon: Icon, label }) => (
                      <span key={label} className="flex items-center gap-1.5">
                        <Icon className="text-[#2c6e9b]" />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-2">
                    {day.activities?.map((activity, aIdx) => (
                      <li
                        key={aIdx}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2c6e9b]" />
                        {activity}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-1.5 border-t border-black/5 pt-3 text-xs text-gray-400">
                    {isLast ? (
                      <>
                        <FaHeart className="text-[#c96b6b]" /> Safe travels
                        &amp; até breve!
                      </>
                    ) : (
                      <>
                        <FaMoon className="text-[#2c6e9b]" /> Overnight in Porto
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
