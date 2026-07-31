"use client";

import {
  CreditCardIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaWandMagicSparkles } from "react-icons/fa6";

import bottomBannerAd from "@/assets/6. user dashboard page/bottom banner ad.png";
import Button from "@/components/ui/Button";

const infoItems = [
  {
    icon: FaWandMagicSparkles,
    title: "AI-Powered Itineraries",
    subtitle: "Tailored just for you",
  },
  {
    icon: TrophyIcon,
    title: "Local Expertise",
    subtitle: "Curated by Porto locals",
  },
  {
    icon: CreditCardIcon,
    title: "Trusted & Secure",
    subtitle: "Your data is safe",
  },
  {
    icon: SparklesIcon,
    title: "Officially Inspired",
    subtitle: "By Porto Tourism Board",
  },
];

// Pages that render their own dedicated bottom CTA already.
const EXCLUDED_PATHS = ["/dashboard/transactions"];

export default function DashboardCTA() {
  const pathname = usePathname();
  if (EXCLUDED_PATHS.includes(pathname)) return null;

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-black/5">
      <Image src={bottomBannerAd} alt="" fill className="object-cover" />

      <div className="relative flex flex-col items-center gap-8 p-8 text-center sm:p-10 lg:flex-row lg:justify-center lg:gap-20 lg:px-28 lg:text-left xl:px-36">
        <div className="max-w-sm">
          <h2 className="font-serif text-2xl text-[#173d5c] sm:text-3xl">
            Plan More. Discover More. Save More.
          </h2>
          <p className="mt-3 text-sm text-[var(--text)]">
            Use your credits to generate new AI travel plans and unlock more
            unforgettable Porto experiences.
          </p>
          <Link href="/ai">
            <Button className="mt-6 cursor-pointer">
              Plan Another Trip &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid max-w-md grid-cols-2 gap-x-8 gap-y-5">
          {infoItems.map((item) => (
            <div key={item.title} className="flex items-start gap-2.5">
              <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2c6e9b]" />
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
