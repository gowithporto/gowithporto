"use client";

import { HeartIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

type FavoriteItem = {
  itemType: string;
  itemId: string;
  title: string;
  image?: string;
  subtitle?: string;
  price?: number;
  href: string;
  external?: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  product: "Shop",
  attraction: "Attraction",
  localExperience: "Experience",
  bikeRental: "Bike Rental",
};

export default function FavoritesList({ favorites }: { favorites: FavoriteItem[] }) {
  const [items, setItems] = useState(favorites);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const removeFavorite = async (item: FavoriteItem) => {
    const key = `${item.itemType}:${item.itemId}`;
    setRemovingId(key);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: item.itemType, itemId: item.itemId }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.filter((i) => `${i.itemType}:${i.itemId}` !== key)
      );
    } catch {
      toast.error("Couldn't remove favorite");
    } finally {
      setRemovingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-white py-16 text-center shadow-sm">
        <HeartIcon className="h-10 w-10 text-[#c0392b]/30" />
        <p className="text-[var(--text)]">No favorites yet.</p>
        <p className="text-sm text-gray-500">
          Tap the heart icon on products, attractions, or bike rentals to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const key = `${item.itemType}:${item.itemId}`;
        return (
          <div
            key={key}
            className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative h-36 w-full overflow-hidden bg-gray-100">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeFavorite(item)}
                disabled={removingId === key}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 disabled:opacity-50 cursor-pointer"
                aria-label="Remove from favorites"
              >
                <HeartIcon className="h-4 w-4 text-[#c0392b]" />
              </button>
              <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#2c6e9b] shadow-sm">
                {TYPE_LABELS[item.itemType] || item.itemType}
              </span>
            </div>

            <div className="space-y-1 p-4">
              <h3 className="truncate font-semibold text-[var(--text)]">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="truncate text-sm text-gray-500">{item.subtitle}</p>
              )}
              {typeof item.price === "number" && (
                <p className="font-bold text-[var(--text)]">€{item.price}</p>
              )}
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="inline-block pt-1 text-sm font-medium text-[#2c6e9b] hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
