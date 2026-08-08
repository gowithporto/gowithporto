"use client";

import LineFooter from "@/assets/center line 2 crop.png";
import FooterFrameBottom from "@/assets/footer frame bottom.png";
import FooterFrameTop from "@/assets/footer frame top.png";
import Image from "next/image";
import Link from "next/link";
import { FaBoxOpen, FaChartLine, FaClipboardList } from "react-icons/fa";

export default function StoreOwnerFooter() {
  return (
    <footer className="relative w-full flex justify-center sm:mt-20">
      {/* TOP FRAME (clipped to the footer's own height so its transparent
          lower half can't add phantom scrollable space below the page) */}
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

      {/* CONTENT */}
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
        {/* Divider */}
        <Image
          src={LineFooter}
          alt="line divider"
          aria-hidden
          priority
          className="mx-auto h-auto w-20 sm:w-60 mb-5 sm:mb-20 mt-10 sm:mt-[-30]"
        />

        {/* GRID */}
        <div className="grid gap-12 text-[#4b5b66] sm:grid-cols-3 text-base">
          {/* PARTNER MESSAGE */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">
              Partner Program
            </h3>

            <p className="text-sm leading-relaxed">
              GoWithPorto helps local Porto businesses reach travelers
              worldwide. Manage your shop, track orders, and grow your digital
              presence.
            </p>

            <div className="flex items-center justify-center gap-2 text-[#2c6e9b]">
              <span>Your shop is part of Porto experience</span>
            </div>
          </div>

          {/* MANAGEMENT TOOLS */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">
              Store Management
            </h3>

            <Link
              href="/store-owner"
              className="flex items-center justify-center gap-2 hover:text-[#2c6e9b] transition"
            >
              <FaChartLine />
              Dashboard
            </Link>

            <Link
              href="/store-owner/products"
              className="flex items-center justify-center gap-2 hover:text-[#2c6e9b] transition"
            >
              <FaBoxOpen />
              Manage Products
            </Link>

            <Link
              href="/store-owner/orders"
              className="flex items-center justify-center gap-2 hover:text-[#2c6e9b] transition"
            >
              <FaClipboardList />
              Orders & Sales
            </Link>
          </div>

          {/* SUPPORT */}
          <div className="space-y-3 grid grid-row-[1fr-auto]">
            <h3 className="font-serif text-xl font-medium text-[#415a6b]">
              Merchant Support
            </h3>

            <Link href="#" className="hover:text-[#2c6e9b] transition">
              Getting Started Guide
            </Link>

            <Link href="#" className="hover:text-[#2c6e9b] transition">
              Commission & Payments
            </Link>

            <Link href="#" className="hover:text-[#2c6e9b] transition">
              Contact Partner Support
            </Link>
          </div>
        </div>

        {/* COPYRIGHT */}
        <p className="m-14 text-sm text-gray-500">
          © {new Date().getFullYear()} GoWithPorto Partner Network — Supporting
          Local Porto Businesses
        </p>
      </div>

      {/* BOTTOM FRAME */}
      <Image
        src={FooterFrameBottom}
        alt=""
        aria-hidden
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
