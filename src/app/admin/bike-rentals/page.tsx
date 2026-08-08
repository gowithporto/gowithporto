"use client";

import Button from "@/components/ui/Button";
import {
  MapPinIcon,
  PencilSquareIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface BikeRentalProviderType {
  _id: string;
  name: string;
  address: string;
  coverImage: string;
  rating?: number;
  reviewCount?: number;
  active: boolean;
}

export default function BikeRentalsAdminPage() {
  const [providers, setProviders] = useState<BikeRentalProviderType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/bike-rentals");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProviders(data);
    } catch {
      toast.error("Failed to load bike rental providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const toggleActive = async (provider: BikeRentalProviderType) => {
    try {
      const res = await fetch(`/api/admin/bike-rentals/${provider._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !provider.active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setProviders((prev) =>
        prev.map((p) =>
          p._id === provider._id ? { ...p, active: !p.active } : p
        )
      );
    } catch {
      toast.error("Failed to update provider");
    }
  };

  const remove = async (provider: BikeRentalProviderType) => {
    if (!confirm(`Delete "${provider.name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/bike-rentals/${provider._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setProviders((prev) => prev.filter((p) => p._id !== provider._id));
      toast.success("Bike rental provider deleted");
    } catch {
      toast.error("Failed to delete provider");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bike Rental Providers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the third-party bike rental shops promoted to visitors
          </p>
        </div>
        <Link href="/admin/bike-rentals/new">
          <Button>Add New Provider</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            Loading bike rental providers...
          </p>
        ) : providers.length === 0 ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            No bike rental providers found. Add one to get started.
          </p>
        ) : (
          providers.map((provider) => (
            <div
              key={provider._id}
              className="group relative overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm transition-all hover:border-black/5 hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                {provider.coverImage && (
                  <img
                    src={provider.coverImage}
                    alt={provider.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {typeof provider.rating === "number" && (
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-[#eab657]">
                      <StarIcon className="h-3.5 w-3.5" /> {provider.rating}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      provider.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {provider.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  {provider.name}
                </h3>
                {provider.address && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {provider.address}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/admin/bike-rentals/${provider._id}/edit`}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-black/10 py-2 text-sm font-medium text-[#2c6e9b] hover:bg-[#2c6e9b]/5"
                  >
                    <PencilSquareIcon className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleActive(provider)}
                    className="flex-1 cursor-pointer rounded-xl border border-black/10 py-2 text-sm font-medium text-gray-600 hover:bg-black/5"
                  >
                    {provider.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(provider)}
                    className="cursor-pointer rounded-xl border border-black/10 p-2 text-red-500 hover:bg-red-50"
                    aria-label="Delete provider"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
