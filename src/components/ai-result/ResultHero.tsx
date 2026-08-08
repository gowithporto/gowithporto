import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaCoins, FaRegClock, FaUsers } from "react-icons/fa";

import banner from "@/assets/5. ai response page/ai response banner.png";
import centerLine from "@/assets/center line 3.png";
import Button from "@/components/ui/Button";
import { formatTripDateRange } from "@/utils/tripDates";

export default function ResultHero({
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
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
      <div>
        <h1 className="font-serif text-4xl font-medium text-[#173d5c] sm:text-5xl">
          Your Porto Trip
        </h1>
        <Image src={centerLine} alt="" className="mt-2 h-auto w-60" />

        <p className="mt-4 text-sm font-medium text-[var(--text)] sm:text-base">
          Tailored for {days} days, {budget} budget, for {people}.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 sm:text-sm">
          {dateRange && (
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-[#2c6e9b]" /> {dateRange}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <FaRegClock className="text-[#2c6e9b]" /> {days} Days
          </span>
          <span className="flex items-center gap-1.5">
            <FaUsers className="text-[#2c6e9b]" /> {people}
          </span>
          <span className="flex items-center gap-1.5">
            <FaCoins className="text-[#2c6e9b]" /> {budget}
          </span>
        </div>

        <Link href="/ai">
          <Button className="mt-6 cursor-pointer">Plan Another Trip</Button>
        </Link>
      </div>

      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image
          src={banner}
          alt="Porto at sunset"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
