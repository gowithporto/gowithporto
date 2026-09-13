"use client";

import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import {
  ArrowTopRightOnSquareIcon,
  HeartIcon as HeartSolid,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

import { useFavorite } from "@/hooks/useFavorite";

type BikeRentalProvider = {
  _id: string;
  name: string;
  coverImage: string;
  overlayColor?: string;
  address?: string;
  googleMapsUrl: string;
  startingPrice?: string;
  rating?: number;
  reviewCount?: number;
};

export default function BikeRentalProviderCard({
  provider,
}: {
  provider: BikeRentalProvider;
}) {
  const { favorited, toggle } = useFavorite("bikeRental", provider._id);
  const overlayColor = provider.overlayColor || "#1d3d5c";

  return (
    <a
      href={provider.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-112 w-full overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
    >
      <img
        src={provider.coverImage}
        alt={provider.name}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background: `linear-gradient(to top, ${overlayColor} 0%, ${overlayColor}cc 35%, ${overlayColor}33 65%, transparent 100%)`,
        }}
      />

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 cursor-pointer"
        aria-label="Save to wishlist"
      >
        {favorited ? (
          <HeartSolid className="h-4 w-4 text-[#c0392b]" />
        ) : (
          <HeartOutline className="h-4 w-4 text-[#2c6e9b]" />
        )}
      </button>

      {typeof provider.rating === "number" && (
        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#eab657] shadow-sm">
          <StarIcon className="h-3.5 w-3.5" />
          {provider.rating}
          {typeof provider.reviewCount === "number" && (
            <span className="text-gray-500">({provider.reviewCount})</span>
          )}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5">
        <h3 className="font-serif text-lg font-semibold text-white drop-shadow-sm">
          {provider.name}
        </h3>
        {provider.address && (
          <p className="flex items-center gap-1 text-sm text-white/80">
            <MapPinIcon className="h-3.5 w-3.5" />
            {provider.address}
          </p>
        )}
        {provider.startingPrice && (
          <p className="text-sm text-white/70">{provider.startingPrice}</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition group-hover:bg-white/25">
          View on Google Maps
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
