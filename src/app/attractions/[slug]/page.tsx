"use client";

import {
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartIcon as HeartOutline,
  MapPinIcon,
  ShareIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import highlightsBg from "@/assets/1. home page/discover_porto/top-attraction bg.png";
import AttractionAiCta from "@/components/attractions/AttractionAiCta";
import AttractionsInfoStrip from "@/components/attractions/AttractionsInfoStrip";
import NearbyPlaces from "@/components/attractions/NearbyPlaces";
import Button from "@/components/ui/Button";
import { useFavorite } from "@/hooks/useFavorite";
import { useLanguage } from "@/providers/LanguageProvider";
import { getAttractionBadge } from "@/utils/attractionBadge";

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Attraction = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  area?: string;
  shortDescription?: string;
  history?: string;
  highlights?: string[];
  gallery?: string[];
  bestTimeToVisit?: string;
  openingHours?: string;
  entryFee?: string;
  howToGetThere?: string;
  mapUrl?: string;
  nearbyHotels?: any[];
  nearbyRestaurants?: any[];
};

export default function AttractionDetailPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const { favorited, toggle: toggleFavorite } = useFavorite(
    "attraction",
    attraction?._id,
  );

  useEffect(() => {
    setImageVisible(false);
    const t = setTimeout(() => setImageVisible(true), 20);
    return () => clearTimeout(t);
  }, [activeImage]);

  useEffect(() => {
    setAttraction(null);
    setNotFound(false);
    setActiveImage(0);

    fetch(`/api/attractions/${slug}?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) setNotFound(true);
        else setAttraction(data);
      })
      .catch(() => setNotFound(true));
  }, [slug, lang]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-32 pb-16 text-center">
        <p className="text-lg text-[var(--text)]">Attraction not found.</p>
        <Link
          href="/attractions"
          className="text-sm text-[#2c6e9b] hover:underline"
        >
          ← Back to Attractions
        </Link>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="grid gap-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:grid-cols-2 lg:px-12">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100" />
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  const images = attraction.gallery?.length ? attraction.gallery : [];
  const badge = getAttractionBadge(attraction.category);
  const mapHref =
    attraction.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${attraction.title}, ${attraction.area ? attraction.area + ", " : ""}Porto, Portugal`,
    )}`;

  const showPrev = () =>
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setActiveImage((i) => (i + 1) % images.length);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: attraction.title, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const quickFacts = [
    attraction.bestTimeToVisit && {
      icon: CalendarDaysIcon,
      label: "Best Time to Visit",
      value: attraction.bestTimeToVisit,
    },
    attraction.openingHours && {
      icon: ClockIcon,
      label: "Opening Hours",
      value: attraction.openingHours,
    },
    attraction.entryFee && {
      icon: BanknotesIcon,
      label: "Entry Fee",
      value: attraction.entryFee,
    },
    attraction.category && {
      icon: TagIcon,
      label: "Category",
      value: formatLabel(attraction.category),
    },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <Link
        href="/attractions"
        className="relative z-60 flex w-fit items-center gap-1 text-sm text-[#2c6e9b] hover:underline"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to Attractions
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm">
            {images[activeImage] && (
              <img
                src={images[activeImage]}
                alt={attraction.title}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageVisible ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {badge && (
              <span
                className={`absolute top-4 left-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${badge.classes}`}
              >
                <badge.icon className="h-3.5 w-3.5" />
                {badge.label}
              </span>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#2c6e9b] shadow-sm transition hover:scale-105"
                  aria-label="Previous photo"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#2c6e9b] shadow-sm transition hover:scale-105"
                  aria-label="Next photo"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                    activeImage === i ? "border-[#2c6e9b]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            {attraction.category && (
              <span className="inline-block rounded-full bg-[#2c6e9b]/10 px-3 py-1 text-xs font-medium text-[#2c6e9b]">
                {formatLabel(attraction.category)}
              </span>
            )}
            <h1 className="font-serif text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {attraction.title}
            </h1>
            {attraction.area && (
              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" />
                {attraction.area}, Porto
              </p>
            )}
          </div>

          {attraction.shortDescription && (
            <p className="text-[var(--text)]/80">{attraction.shortDescription}</p>
          )}

          {quickFacts.length > 0 && (
            <>
              <div className="flex items-center justify-center gap-2 text-[#eab657]">
                <span className="h-px flex-1 bg-[#eab657]/30" />
                <span className="text-[10px]">✦</span>
                <span className="h-px flex-1 bg-[#eab657]/30" />
              </div>

              <div className="grid grid-cols-2 border-black/5 divide-x divide-y divide-black/5">
                {quickFacts.map((fact, i) => (
                  <div
                    key={fact.label}
                    className={`flex items-start gap-2.5 py-3 ${
                      i % 2 === 0 ? "pr-4" : "pl-4"
                    }`}
                  >
                    <fact.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#2c6e9b]" />
                    <div>
                      <p className="text-xs text-gray-500">{fact.label}</p>
                      <p className="text-sm font-medium text-[var(--text)]">
                        {fact.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {attraction.howToGetThere && (
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group block space-y-2 rounded-2xl border border-[#eab657]/25 bg-[#eab657]/8 p-4 transition hover:border-[#eab657]/50 hover:bg-[#eab657]/12"
            >
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#a9782f]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    How to Get There
                  </p>
                  <p className="text-sm text-gray-600">
                    {attraction.howToGetThere}
                  </p>
                  <span className="inline-block text-sm font-medium text-[#2c6e9b] group-hover:underline">
                    View on Map →
                  </span>
                </div>
              </div>
            </a>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              className="flex-1 gap-2 cursor-pointer"
              onClick={toggleFavorite}
            >
              {favorited ? (
                <HeartSolid className="h-4 w-4" />
              ) : (
                <HeartOutline className="h-4 w-4" />
              )}
              {favorited ? "Saved to Favorites" : "Add to Favorites"}
            </Button>
            <Button
              variant="outline"
              className="gap-2 cursor-pointer border-[#2c6e9b] text-[#2c6e9b] hover:bg-[#2c6e9b]/5"
              onClick={share}
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {attraction.history && (
          <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-medium text-[var(--primary)]">
              About {attraction.title}
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--text)]/80">
              {attraction.history}
            </p>
          </div>
        )}

        {!!attraction.highlights?.length && (
          <div className="relative space-y-3 overflow-hidden rounded-2xl border border-black/5 p-6">
            <Image
              src={highlightsBg}
              alt=""
              fill
              className="object-cover object-right"
            />
            <h2 className="relative font-serif text-xl font-medium text-[var(--primary)]">
              Highlights
            </h2>
            <ul className="relative space-y-2.5">
              {attraction.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-[var(--text)]/80"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2c6e9b]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AttractionAiCta title={attraction.title} />

      <div className="grid gap-8 lg:grid-cols-2">
        <NearbyPlaces title="Nearby Hotels" places={attraction.nearbyHotels || []} />
        <NearbyPlaces
          title="Nearby Restaurants"
          places={attraction.nearbyRestaurants || []}
        />
      </div>

      <AttractionsInfoStrip />
    </div>
  );
}
