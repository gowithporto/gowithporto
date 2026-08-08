import { ArrowTopRightOnSquareIcon, MapPinIcon, StarIcon } from "@heroicons/react/24/solid";

type BikeRentalProvider = {
  _id: string;
  name: string;
  coverImage: string;
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
  return (
    <a
      href={provider.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={provider.coverImage}
          alt={provider.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {typeof provider.rating === "number" && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#eab657] shadow-sm">
            <StarIcon className="h-3.5 w-3.5" />
            {provider.rating}
            {typeof provider.reviewCount === "number" && (
              <span className="text-gray-500">({provider.reviewCount})</span>
            )}
          </span>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="font-semibold text-[var(--text)]">{provider.name}</h3>
        {provider.address && (
          <p className="flex items-center gap-1 text-sm text-gray-500">
            <MapPinIcon className="h-3.5 w-3.5" />
            {provider.address}
          </p>
        )}
        {provider.startingPrice && (
          <p className="text-sm text-gray-500">{provider.startingPrice}</p>
        )}
        <span className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-[#2c6e9b]">
          View on Google Maps
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
