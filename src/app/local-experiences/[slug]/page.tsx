"use client";

import {
  BanknotesIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartIcon as HeartOutline,
  MapPinIcon,
  ShieldCheckIcon,
  ShareIcon,
  TagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import LocalExperiencesAiCta from "@/components/localExperiences/LocalExperiencesAiCta";
import LocalExperiencesInfoStrip from "@/components/localExperiences/LocalExperiencesInfoStrip";
import Button from "@/components/ui/Button";
import { useFavorite } from "@/hooks/useFavorite";
import { useLanguage } from "@/providers/LanguageProvider";
import { formatExperienceLabel } from "@/utils/experienceBadge";

type LocalExperience = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  area?: string;
  shortDescription?: string;
  story?: string;
  highlights?: string[];
  included?: string[];
  gallery?: string[];
  duration?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  meetingPoint?: string;
  groupSize?: string;
  cancellationPolicy?: string;
  mapUrl?: string;
  popular?: boolean;
};

export default function LocalExperienceDetailPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const [experience, setExperience] = useState<LocalExperience | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const { favorited, toggle: toggleFavorite } = useFavorite(
    "localExperience",
    experience?._id,
  );

  useEffect(() => {
    setImageVisible(false);
    const t = setTimeout(() => setImageVisible(true), 20);
    return () => clearTimeout(t);
  }, [activeImage]);

  useEffect(() => {
    setExperience(null);
    setNotFound(false);
    setActiveImage(0);

    fetch(`/api/local-experiences/${slug}?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) setNotFound(true);
        else setExperience(data);
      })
      .catch(() => setNotFound(true));
  }, [slug, lang]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-32 pb-16 text-center">
        <p className="text-lg text-[var(--text)]">Experience not found.</p>
        <Link
          href="/local-experiences"
          className="text-sm text-[#2c6e9b] hover:underline"
        >
          ← Back to Local Experiences
        </Link>
      </div>
    );
  }

  if (!experience) {
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

  const images = experience.gallery?.length ? experience.gallery : [];
  const mapHref =
    experience.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${experience.title}, ${experience.area ? experience.area + ", " : ""}Porto, Portugal`,
    )}`;

  const showPrev = () =>
    setActiveImage((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setActiveImage((i) => (i + 1) % images.length);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: experience.title, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const quickFacts = [
    experience.duration && {
      icon: ClockIcon,
      label: "Duration",
      value: experience.duration,
    },
    experience.price !== undefined && experience.price !== null && {
      icon: BanknotesIcon,
      label: "Price",
      value: `From €${experience.price}`,
    },
    experience.groupSize && {
      icon: UserGroupIcon,
      label: "Group Size",
      value: experience.groupSize,
    },
    experience.category && {
      icon: TagIcon,
      label: "Category",
      value: formatExperienceLabel(experience.category),
    },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <Link
        href="/local-experiences"
        className="relative z-60 flex w-fit items-center gap-1 text-sm text-[#2c6e9b] hover:underline"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to Local Experiences
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm">
            {images[activeImage] && (
              <img
                src={images[activeImage]}
                alt={experience.title}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageVisible ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {experience.popular && (
              <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#2c6e9b] shadow-sm">
                Popular
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
            {experience.category && (
              <span className="inline-block rounded-full bg-[#2c6e9b]/10 px-3 py-1 text-xs font-medium text-[#2c6e9b]">
                {formatExperienceLabel(experience.category)}
              </span>
            )}
            <h1 className="font-serif text-3xl font-medium text-[var(--primary)] sm:text-4xl">
              {experience.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {experience.area && (
                <p className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  {experience.area}, Porto
                </p>
              )}
              {experience.rating !== undefined && experience.rating !== null && (
                <p className="flex items-center gap-1 text-[var(--text)]">
                  <StarIcon className="h-4 w-4 text-[#eab657]" />
                  <span className="font-medium">{experience.rating.toFixed(1)}</span>
                  {!!experience.reviewCount && (
                    <span className="text-gray-400">
                      ({experience.reviewCount} reviews)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {experience.shortDescription && (
            <p className="text-[var(--text)]/80">{experience.shortDescription}</p>
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

          {experience.meetingPoint && (
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
                    Meeting Point
                  </p>
                  <p className="text-sm text-gray-600">{experience.meetingPoint}</p>
                  <span className="inline-block text-sm font-medium text-[#2c6e9b] group-hover:underline">
                    View on Map →
                  </span>
                </div>
              </div>
            </a>
          )}

          {experience.cancellationPolicy && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2c6e9b]" />
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  Cancellation Policy
                </p>
                <p className="text-sm text-gray-500">
                  {experience.cancellationPolicy}
                </p>
              </div>
            </div>
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
        {experience.story && (
          <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-medium text-[var(--primary)]">
              About this Experience
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--text)]/80">
              {experience.story}
            </p>
          </div>
        )}

        {!!experience.highlights?.length && (
          <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-medium text-[var(--primary)]">
              Highlights
            </h2>
            <ul className="space-y-2.5">
              {experience.highlights.map((h, i) => (
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

      {!!experience.included?.length && (
        <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-medium text-[var(--primary)]">
            What&apos;s Included
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {experience.included.map((inc, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-[var(--text)]/80"
              >
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2c6e9b]" />
                {inc}
              </li>
            ))}
          </ul>
        </div>
      )}

      <LocalExperiencesAiCta />

      <LocalExperiencesInfoStrip />
    </div>
  );
}
