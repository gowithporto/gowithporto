"use client";

import { useEffect, useState } from "react";

import BikeRentalProviderCard from "@/components/bikeRentals/BikeRentalProviderCard";
import BikeRentalsBanner from "@/components/bikeRentals/BikeRentalsBanner";

export default function BikeRentalsPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bike-rentals")
      .then((res) => res.json())
      .then((data) => setProviders(Array.isArray(data) ? data : []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <BikeRentalsBanner />

      <div className="space-y-6">
        <p className="text-sm text-[var(--text)]">
          <span className="font-semibold text-[#2c6e9b]">
            {providers.length}
          </span>{" "}
          Bike Rental Shops
        </p>

        {loading ? (
          <p className="py-16 text-center text-sm text-gray-500">
            Loading bike rental shops...
          </p>
        ) : providers.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            No bike rental shops listed yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <BikeRentalProviderCard key={provider._id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
