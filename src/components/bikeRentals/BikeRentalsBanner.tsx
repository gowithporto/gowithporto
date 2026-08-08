import Image from "next/image";

import bikeBanner from "@/assets/1. home page/rent bike banner section photo.png";

export default function BikeRentalsBanner() {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-3xl border border-black/5 sm:h-[400px]">
      <Image
        src={bikeBanner}
        alt="Cyclist riding along the Douro riverfront in Porto"
        fill
        priority
        className="object-cover object-right"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />

      <div className="relative flex h-full items-center">
        <div className="max-w-md pl-6 sm:pl-12">
          <h1 className="font-serif font-medium text-[var(--primary)]">
            <span className="block text-2xl sm:text-3xl">Explore Porto on</span>
            <span className="block text-5xl sm:text-6xl">Two Wheels</span>
          </h1>
          <div className="mt-3 h-[2px] w-16 bg-[#2c6e9b]/40" />
          <p className="mt-5 text-[var(--text)]">
            We&apos;ve rounded up trusted local bike rental shops around
            Porto. Pick one, open it on Google Maps, and sort out your ride
            directly with them.
          </p>
        </div>
      </div>
    </div>
  );
}
