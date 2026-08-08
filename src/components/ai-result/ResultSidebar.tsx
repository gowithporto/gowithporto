"use client";

import Image from "next/image";
import {
  FaCalendarAlt,
  FaCoins,
  FaDownload,
  FaHeadset,
  FaMapMarkerAlt,
  FaRegClock,
  FaUsers,
} from "react-icons/fa";

import towerAd from "@/assets/5. ai response page/1st right ad photo.png";
import worldMapAd from "@/assets/5. ai response page/2nd right ad photo.png";
import ShopAdCard from "@/components/shop/ShopAdCard";
import Button from "@/components/ui/Button";
import { formatTripDateRange } from "@/utils/tripDates";

const recommendations = [
  "Handpicked activities & tours",
  "Restaurant suggestions",
  "Private transfers",
  "Local tips & hidden gems",
  "Google Maps links",
];

export default function ResultSidebar({
  days,
  budget,
  people,
  dates,
}: {
  days: number;
  budget: string;
  people: string;
  dates?: string;
}) {
  const dateRange = formatTripDateRange(dates, days);

  return (
    <aside className="space-y-6">
      {/* Inspired by Porto */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2c6e9b]/15 bg-[#ffffff] p-5">
        <Image
          src={towerAd}
          alt=""
          className="pointer-events-none absolute right-0 bottom-0 h-40 w-auto object-contain"
        />
        <div className="relative max-w-[70%]">
          <p className="text-xs font-medium text-gray-400">Inspired by</p>
          <p className="font-serif text-2xl font-medium text-[#2c6e9b]">Porto.</p>
          <p className="mt-2 text-xs font-semibold text-[var(--text)]">
            Official Tourism Partner
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Content aligned with Visit Porto guidelines.
          </p>
          <span className="mt-2 inline-block cursor-default text-xs font-medium text-[#2c6e9b]">
            Learn more →
          </span>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <Image
          src={worldMapAd}
          alt=""
          className="pointer-events-none absolute inset-x-0 top-10 mx-auto w-56 opacity-35"
        />
        <div className="relative">
          <h3 className="font-serif text-lg font-medium text-[var(--primary)]">
            Trip Summary
          </h3>

          <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
            <li className="flex items-center gap-2.5">
              <FaRegClock className="text-[#2c6e9b]" />
              {days} Days / {Math.max(0, days - 1)} Nights
            </li>
            <li className="flex items-center gap-2.5">
              <FaMapMarkerAlt className="text-[#2c6e9b]" />
              Porto, Portugal
            </li>
            <li className="flex items-center gap-2.5">
              <FaUsers className="text-[#2c6e9b]" />
              {people} Trip
            </li>
            <li className="flex items-center gap-2.5">
              <FaCoins className="text-[#2c6e9b]" />
              {budget} Budget
            </li>
            {dateRange && (
              <li className="flex items-center gap-2.5">
                <FaCalendarAlt className="text-[#2c6e9b]" />
                {dateRange}
              </li>
            )}
          </ul>

          <Button
            variant="outline"
            className="mt-5 w-full cursor-pointer gap-2 border-[#2c6e9b] text-[#2c6e9b] hover:bg-[#2c6e9b]/5"
            onClick={() => window.print()}
          >
            <FaDownload /> Download Itinerary
          </Button>
        </div>
      </div>

      {/* Included Recommendations */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h3 className="font-serif text-lg font-medium text-[var(--primary)]">
          Included Recommendations
        </h3>
        <ul className="mt-4 space-y-2.5">
          {recommendations.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-gray-600"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2c6e9b]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Souvenir ad */}
      <ShopAdCard />

      {/* Need help */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h3 className="font-serif text-lg font-medium text-[var(--primary)]">Need Help?</h3>
        <p className="mt-2 text-sm text-gray-500">
          We&apos;re here for you before, during and after your trip.
        </p>
        <Button
          variant="outline"
          className="mt-4 w-full cursor-pointer gap-2 border-[#2c6e9b] text-[#2c6e9b] hover:bg-[#2c6e9b]/5"
        >
          <FaHeadset /> Contact Support
        </Button>
        <p className="mt-2 text-center text-xs text-gray-400">
          Response within 24h
        </p>
      </div>
    </aside>
  );
}
