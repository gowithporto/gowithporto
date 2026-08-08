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

interface AttractionType {
  _id: string;
  title: string;
  slug: string;
  category: string;
  area: string;
  gallery: string[];
  active: boolean;
  featured: boolean;
}

export default function AttractionsAdminPage() {
  const [attractions, setAttractions] = useState<AttractionType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttractions = async () => {
    try {
      const res = await fetch("/api/admin/attractions");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAttractions(data);
    } catch {
      toast.error("Failed to load attractions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  const toggleActive = async (attraction: AttractionType) => {
    try {
      const res = await fetch(`/api/admin/attractions/${attraction._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !attraction.active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setAttractions((prev) =>
        prev.map((a) =>
          a._id === attraction._id ? { ...a, active: !a.active } : a
        )
      );
    } catch {
      toast.error("Failed to update attraction");
    }
  };

  const remove = async (attraction: AttractionType) => {
    if (!confirm(`Delete "${attraction.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/attractions/${attraction._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setAttractions((prev) => prev.filter((a) => a._id !== attraction._id));
      toast.success("Attraction deleted");
    } catch {
      toast.error("Failed to delete attraction");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attractions Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the Top Attractions shown to visitors
          </p>
        </div>
        <Link href="/admin/attractions/new">
          <Button>Add New Attraction</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            Loading attractions...
          </p>
        ) : attractions.length === 0 ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            No attractions found. Create one to get started.
          </p>
        ) : (
          attractions.map((attraction) => (
            <div
              key={attraction._id}
              className="group relative overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm transition-all hover:border-black/5 hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                {attraction.gallery?.[0] && (
                  <img
                    src={attraction.gallery[0]}
                    alt={attraction.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {attraction.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-[#eab657]">
                      <StarIcon className="h-3.5 w-3.5" /> Featured
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      attraction.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {attraction.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">
                  {attraction.title}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {attraction.category}
                </p>
                {attraction.area && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {attraction.area}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/admin/attractions/${attraction._id}/edit`}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-black/10 py-2 text-sm font-medium text-[#2c6e9b] hover:bg-[#2c6e9b]/5"
                  >
                    <PencilSquareIcon className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleActive(attraction)}
                    className="flex-1 cursor-pointer rounded-xl border border-black/10 py-2 text-sm font-medium text-gray-600 hover:bg-black/5"
                  >
                    {attraction.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(attraction)}
                    className="cursor-pointer rounded-xl border border-black/10 p-2 text-red-500 hover:bg-red-50"
                    aria-label="Delete attraction"
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
