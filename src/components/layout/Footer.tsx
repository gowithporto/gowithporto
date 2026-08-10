"use client";

import LineFooter from "@/assets/center line 3.png";
import FooterFrameBottom from "@/assets/footer frame bottom.png";
import FooterFrameTop from "@/assets/footer frame top.png";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
export default function Footer() {
  const { data: session } = useSession();

  const isGuest = !session;
  const isAdmin = session?.user?.role === "ADMIN";

  /* ---------------- ADMIN FOOTER (UNCHANGED) ---------------- */
  if (isAdmin) {
    return (
      <footer className="mt-auto border-t bg-white px-6 py-4 text-center text-xs text-gray-500">
        <p>Admin Portal &copy; {new Date().getFullYear()} GoWithPorto</p>
      </footer>
    );
  }

  /* ---------------- MAIN FOOTER ---------------- */
  return (
    <footer className="relative sm:mt-24 w-full flex justify-center">
      {/* TOP AZULEJO FRAME (clipped to the footer's own height so its
          transparent lower half can't add phantom scrollable space below the page) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={FooterFrameTop}
          alt=""
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
          className="mx-auto h-auto w-20 sm:w-60 mb-5 sm:mb-20 mt-10 sm:mt-[-30]"
          priority
          alt="line divider"
          src={LineFooter}
        />

        {/* LINKS GRID */}
        <div
          className="
            grid gap-12 text-[#4b5b66]
            sm:grid-cols-3
            text-base
          "
        >
          {/* Company */}
          <div className="space-y-3 grid grid-row-[1fr_auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">Company</h3>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
          </div>

          {/* Services */}
          <div className="space-y-3 grid grid-row-[1fr_auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">Services</h3>
            <Link href="/ai">AI Trip Planner</Link>
            <Link href="/shop">Souvenirs Shop</Link>
            <Link href="#">Local Guides</Link>
            <Link href="/bike-rentals">Bike Rentals</Link>
          </div>

          {/* Support */}
          <div className="space-y-3 grid grid-row-[1fr_auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">Support</h3>
            <Link href="/faq">Help Center</Link>
            <Link href="/privacy">Privacy Policy</Link>

            {/* GUEST LINKS (UNCHANGED LOGIC) */}
            {isGuest && (
              <div className="pt-3 space-y-2 grid grid-row-[1fr_auto]">
                <Link href="/store-owner/login">Store Owner Login</Link>
                <Link href="/admin/login">Admin Login</Link>
              </div>
            )}
          </div>
        </div>

        {/* COPYRIGHT */}
        <p className="mt-14 mb-10 text-sm text-gray-500">
          © {new Date().getFullYear()} GoWithPorto. All rights reserved.
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
