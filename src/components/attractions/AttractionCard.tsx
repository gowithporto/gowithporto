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
};

export default function AttractionCard({ attraction }: { attraction: Attraction }) {
  const badge = getAttractionBadge(attraction.category);

  return (
    <Link
      href={`/attractions/${attraction.slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={attraction.gallery?.[0]}
          alt={attraction.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {badge && (
          <span
            className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${badge.classes}`}
          >
            <badge.icon className="h-3.5 w-3.5" />
            {badge.label}
          </span>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="font-semibold text-[var(--text)]">{attraction.title}</h3>
        {attraction.area && (
          <p className="flex items-center gap-1 text-sm text-gray-500">
            <MapPinIcon className="h-3.5 w-3.5" />
            {attraction.area}
          </p>
        )}
        {attraction.shortDescription && (
          <p className="line-clamp-2 text-sm text-gray-500">
            {attraction.shortDescription}
          </p>
        )}
        <span className="inline-block pt-1 text-sm font-medium text-[#2c6e9b]">
          View Details →
        </span>
      </div>
    </Link>
  );
}
