"use client";

import { cn } from "@/utils/cn";
import { useRef, useState, useEffect, Children } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Carousel({
  children,
  itemClassName,
}: {
  children: React.ReactNode;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const maxIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const items = Children.toArray(children);

  const getStep = (track: HTMLDivElement) => {
    const card = track.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + 16 : track.offsetWidth * 0.8;
  };

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * getStep(track), behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Dots represent actual reachable scroll positions, not raw item count —
    // several cards are visible at once, so the last few items never get their
    // own distinct scroll stop and their dots would be permanently unreachable.
    const updateMaxIndex = () => {
      const step = getStep(track);
      const max = Math.max(
        0,
        Math.round((track.scrollWidth - track.clientWidth) / step),
      );
      maxIndexRef.current = max;
      setMaxIndex(max);
    };

    const onScroll = () => {
      const step = getStep(track);
      const index = Math.round(track.scrollLeft / step);
      setActiveIndex(Math.min(maxIndexRef.current, Math.max(0, index)));
    };

    updateMaxIndex();
    onScroll();

    const resizeObserver = new ResizeObserver(updateMaxIndex);
    resizeObserver.observe(track);

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollByCard(-1)}
        className="absolute left-0 top-1/2 z-10 hidden -translate-x-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/90 p-2.5 text-[var(--primary)] shadow-md transition hover:scale-105 sm:flex"
      >
        <FaChevronLeft size={14} />
      </button>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div
            key={i}
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollByCard(1)}
        className="absolute right-0 top-1/2 z-10 hidden translate-x-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white/90 p-2.5 text-[var(--primary)] shadow-md transition hover:scale-105 sm:flex"
      >
        <FaChevronRight size={14} />
      </button>

      <div className="mt-4 flex justify-center gap-1.5">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === activeIndex
                ? "w-5 bg-[var(--primary)]"
                : "w-1.5 bg-[var(--primary)]/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
