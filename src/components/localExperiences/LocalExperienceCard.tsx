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
  return (
    <Link
      href={`/local-experiences/${experience.slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={experience.gallery?.[0]}
          alt={experience.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
      </div>

      <div className="space-y-1 p-4">
        {experience.duration && (
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <ClockIcon className="h-3.5 w-3.5" />
            {experience.duration}
          </p>
        )}
        <h3 className="font-medium text-[var(--text)]">{experience.title}</h3>
        {experience.shortDescription && (
          <p className="line-clamp-2 text-sm text-gray-500">
            {experience.shortDescription}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          {experience.area && (
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <MapPinIcon className="h-3.5 w-3.5" />
              {experience.area}
            </p>
          )}
          {experience.rating !== undefined && experience.rating !== null && (
            <p className="flex items-center gap-1 text-sm text-[var(--text)]">
              <StarIcon className="h-3.5 w-3.5 text-[#eab657]" />
              <span className="font-medium">{experience.rating.toFixed(1)}</span>
              {!!experience.reviewCount && (
                <span className="text-gray-400">({experience.reviewCount})</span>
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
