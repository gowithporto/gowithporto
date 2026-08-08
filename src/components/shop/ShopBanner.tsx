import Image from "next/image";

import banner from "@/assets/2. shop page/banner.png";

export default function ShopBanner() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl sm:h-[380px]">
      <Image
        src={banner}
        alt="Porto riverside"
        fill
        priority
        className="object-cover object-right"
      />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-md pl-6 sm:pl-12">
          <h1 className="font-serif text-4xl font-medium text-[#1c4c73] sm:text-5xl">
            Shop Porto Souvenirs
          </h1>
          <div className="mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
          <p className="mt-5 text-[var(--text)]">
            Take a piece of Porto home with you. Authentic souvenirs inspired by
            our culture, heritage and charm.
          </p>
        </div>
      </div>
    </div>
  );
}
