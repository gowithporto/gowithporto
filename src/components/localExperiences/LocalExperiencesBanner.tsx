import Image from "next/image";

import heroArt from "@/assets/1. home page/Hero banner.png";

export default function LocalExperiencesBanner() {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-3xl border border-black/5 sm:h-[400px]">
      <Image
        src={heroArt}
        alt="Porto riverside, boats and traditional streets"
        fill
        priority
        className="object-cover object-right"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />

      <div className="relative flex h-full items-center">
        <div className="max-w-md pl-6 sm:pl-12">
          <h1 className="font-serif font-normal text-[var(--primary)]">
            <span className="block text-2xl sm:text-3xl">
              Local Experiences
            </span>
          </h1>
          <div className="mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
          <p className="mt-5 text-[var(--text)]">
            Dive into the soul of Porto. Authentic activities, local
            traditions, flavors and stories that make Porto unique.
          </p>
        </div>
      </div>
    </div>
  );
}
