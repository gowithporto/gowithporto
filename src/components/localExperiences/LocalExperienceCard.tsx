import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "@/components/ui/LocalizedLink";

type LocalExperience = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  area?: string;
  shortDescription?: string;
  gallery?: string[];
  overlayColor?: string;
  duration?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  popular?: boolean;
};

export default function LocalExperienceCard({
  experience,
}: {
  experience: LocalExperience;
}) {
  const overlayColor = experience.overlayColor || "#1d3d5c";

  return (
    <Link
      href={`/local-experiences/${experience.slug}`}
      className="group relative block h-112 w-full overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
    >
      <img
        src={experience.gallery?.[0]}
        alt={experience.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background: `linear-gradient(to top, ${overlayColor} 0%, ${overlayColor}cc 35%, ${overlayColor}33 65%, transparent 100%)`,
        }}
      />

      {experience.popular && (
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#2c6e9b] shadow-sm">
          Popular
        </span>
      )}
      {experience.price !== undefined && experience.price !== null && (
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--text)] shadow-sm">
          From €{experience.price}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5">
        {experience.duration && (
          <p className="flex items-center gap-1 text-xs text-white/70">
            <ClockIcon className="h-3.5 w-3.5" />
            {experience.duration}
          </p>
        )}
        <h3 className="font-serif text-lg font-semibold text-white drop-shadow-sm">
          {experience.title}
        </h3>
        {experience.shortDescription && (
          <p className="line-clamp-2 text-sm text-white/70">
            {experience.shortDescription}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          {experience.area && (
            <p className="flex items-center gap-1 text-sm text-white/80">
              <MapPinIcon className="h-3.5 w-3.5" />
              {experience.area}
            </p>
          )}
          {experience.rating !== undefined && experience.rating !== null && (
            <p className="flex items-center gap-1 text-sm text-white">
              <StarIcon className="h-3.5 w-3.5 text-[#eab657]" />
              <span className="font-medium">{experience.rating.toFixed(1)}</span>
              {!!experience.reviewCount && (
                <span className="text-white/60">({experience.reviewCount})</span>
              )}
            </p>
          )}
        </div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition group-hover:bg-white/25">
          View Details →
        </span>
      </div>
    </Link>
  );
}
