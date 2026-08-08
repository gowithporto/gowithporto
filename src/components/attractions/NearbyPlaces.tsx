"use client";

import { ArrowTopRightOnSquareIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

type NearbyPlace = {
  name: string;
  blurb?: string;
  image?: string;
  externalLink?: string;
  distance?: string;
  rating?: number;
  reviewCount?: number;
};

function PlaceCard({ place }: { place: NearbyPlace }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
      {place.image && (
        <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={place.image}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0 space-y-1 py-0.5">
        <h3 className="truncate font-semibold text-[var(--text)]">
          {place.name}
        </h3>
        {place.distance && (
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPinIcon className="h-3.5 w-3.5" />
            {place.distance}
          </p>
        )}
        {place.blurb && (
          <p className="line-clamp-2 text-sm text-gray-500">{place.blurb}</p>
        )}
        <div className="flex items-center gap-3 pt-0.5">
          {typeof place.rating === "number" && (
            <span className="flex items-center gap-1 text-xs font-medium text-[#a9782f]">
              <StarIcon className="h-3.5 w-3.5" />
              {place.rating.toFixed(1)}
              {typeof place.reviewCount === "number" && (
                <span className="font-normal text-gray-400">
                  ({place.reviewCount} reviews)
                </span>
              )}
            </span>
          )}
          {place.externalLink && (
            <a
              href={place.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-[#2c6e9b] hover:underline"
            >
              View Details <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NearbyPlaces({
  title,
  places,
}: {
  title: string;
  places: NearbyPlace[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (!places?.length) return null;

  const [first, ...rest] = places;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-[var(--primary)]">{title}</h2>
        {rest.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="cursor-pointer text-sm font-medium text-[#2c6e9b] hover:underline"
          >
            {expanded ? "Show Less" : `View All (${places.length}) →`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <PlaceCard place={first} />
        {expanded &&
          rest.map((place, i) => <PlaceCard key={place.name + i} place={place} />)}
      </div>
    </div>
  );
}
