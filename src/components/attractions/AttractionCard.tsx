import { MapPinIcon } from "@heroicons/react/24/solid";
import Link from "@/components/ui/LocalizedLink";

import { getAttractionBadge } from "@/utils/attractionBadge";

type Attraction = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  area?: string;
  shortDescription?: string;
  gallery?: string[];
  overlayColor?: string;
};

export default function AttractionCard({ attraction }: { attraction: Attraction }) {
  const badge = getAttractionBadge(attraction.category);
  const overlayColor = attraction.overlayColor || "#1d3d5c";

  return (
    <Link
      href={`/attractions/${attraction.slug}`}
      className="group relative block h-112 w-full overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
    >
      <img
        src={attraction.gallery?.[0]}
        alt={attraction.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background: `linear-gradient(to top, ${overlayColor} 0%, ${overlayColor}cc 35%, ${overlayColor}33 65%, transparent 100%)`,
        }}
      />

      {badge && (
        <span
          className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${badge.classes}`}
        >
          <badge.icon className="h-3.5 w-3.5" />
          {badge.label}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5">
        <h3 className="font-serif text-lg font-semibold text-white drop-shadow-sm">
          {attraction.title}
        </h3>
        {attraction.area && (
          <p className="flex items-center gap-1 text-sm text-white/80">
            <MapPinIcon className="h-3.5 w-3.5" />
            {attraction.area}
          </p>
        )}
        {attraction.shortDescription && (
          <p className="line-clamp-2 text-sm text-white/70">
            {attraction.shortDescription}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition group-hover:bg-white/25">
          View Details →
        </span>
      </div>
    </Link>
  );
}
