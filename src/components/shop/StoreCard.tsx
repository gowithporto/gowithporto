import { MapPinIcon } from "@heroicons/react/24/outline";

import Link from "@/components/ui/LocalizedLink";

type Props = {
  name: string;
  slug: string;
  location?: string;
  tagline?: string;
  logoUrl?: string;
  bannerUrl?: string;
};

export default function StoreCard({
  name,
  slug,
  location,
  tagline,
  logoUrl,
  bannerUrl,
}: Props) {
  return (
    <Link
      href={`/stores/${slug}`}
      className="group relative block h-56 w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition hover:shadow-lg"
    >
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      )}

      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 30%, transparent 70%)",
          maskImage:
            "linear-gradient(to top, black 0%, black 30%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 30%, transparent 70%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 space-y-1 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
            {logoUrl && (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
            )}
          </div>
          <h3 className="font-semibold text-white drop-shadow-sm">{name}</h3>
        </div>

        {tagline && (
          <p className="line-clamp-2 text-sm text-white/80">{tagline}</p>
        )}

        {location && (
          <p className="flex items-center gap-1 text-xs text-white/70">
            <MapPinIcon className="h-3.5 w-3.5" />
            {location}
          </p>
        )}
      </div>
    </Link>
  );
}
