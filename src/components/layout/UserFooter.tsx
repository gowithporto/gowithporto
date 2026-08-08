"use client";

import LineFooter from "@/assets/center line 2 crop.png";
import FooterFrameBottom from "@/assets/footer frame bottom.png";
import FooterFrameTop from "@/assets/footer frame top.png";
import Image from "next/image";
import Link from "next/link";
export default function UserFooter() {
  return (
    <footer className="relative w-full flex justify-center sm:mt-20">
      {/* TOP AZULEJO FRAME (clipped to the footer's own height so its
          transparent lower half can't add phantom scrollable space below the page) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={FooterFrameTop}
          alt=""
          aria-hidden
          priority
          className="
            select-none
            w-full max-w-dvw
            absolute top-0 left-1/2 -translate-x-1/2
          "
        />
      </div>

      {/* CONTENT AREA */}
      <div
        className="
          relative z-10
          w-full max-w-5xl
          px-6
          sm:px-12
          lg:px-20
          text-center
          sm:py-16
          lg:py-24
          xl:py-28
        "
      >
        {/* decorative divider */}
        <Image
          src={LineFooter}
          alt="line divider"
          priority
          className="mx-auto h-auto w-20 sm:w-60 mb-5 sm:mb-20 mt-10 sm:mt-[-30]"
        />

        {/* LINKS GRID */}
        <div
          className="grid gap-12 text-[#4b5b66]
            sm:grid-cols-3
            text-base"
        >
          {/* BRAND */}
          <div className="space-y-3 grid grid-row-[1fr-auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">GoWithPorto</h3>
            <p className="text-sm">
              Your personal AI travel companion for exploring Porto.
            </p>

            <Link href="/ai" className="hover:text-[#2c6e9b] transition">
              Plan a New Trip
            </Link>
            <Link href="/shop" className="hover:text-[#2c6e9b] transition">
              Souvenir Marketplace
            </Link>
          </div>

          {/* MY TRAVEL */}
          <div className="space-y-3 grid grid-row-[1fr-auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">My Travel</h3>

            <Link
              href="/dashboard/ai-history"
              className="hover:text-[#2c6e9b] transition"
            >
              My Trips
            </Link>

            <Link href="/cart" className="hover:text-[#2c6e9b] transition">
              My Cart
            </Link>
            <Link
              href="/dashboard/orders"
              className="hover:text-[#2c6e9b] transition"
            >
              Order History
            </Link>
          </div>

          {/* SUPPORT */}
          <div className="space-y-3 grid grid-row-[1fr-auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">Support</h3>

            <Link href="/faq" className="hover:text-[#2c6e9b] transition">
              Help Center
            </Link>
            <Link href="/contact" className="hover:text-[#2c6e9b] transition">
              Contact Support
            </Link>
            <Link href="/privacy" className="hover:text-[#2c6e9b] transition">
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* COPYRIGHT */}
        <p className="mt-14 mb-10 text-sm text-gray-500">
          © {new Date().getFullYear()} GoWithPorto — Happy travels
        </p>
      </div>

      {/* BOTTOM AZULEJO FRAME */}
      <Image
        src={FooterFrameBottom}
        alt=""
        priority
        className="
          pointer-events-none select-none
          w-full max-w-dvw
          absolute left-1/2 -translate-x-1/2
          z-0 bottom-0
        "
      />
    </footer>
  );
}
