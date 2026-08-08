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

interface LocalExperienceType {
  _id: string;
  title: string;
  slug: string;
  category: string;
  area: string;
  price?: number;
  gallery: string[];
  active: boolean;
  featured: boolean;
  popular: boolean;
}

export default function LocalExperiencesAdminPage() {
  const [experiences, setExperiences] = useState<LocalExperienceType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/admin/local-experiences");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setExperiences(data);
    } catch {
      toast.error("Failed to load local experiences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const toggleActive = async (experience: LocalExperienceType) => {
    try {
      const res = await fetch(`/api/admin/local-experiences/${experience._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !experience.active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setExperiences((prev) =>
        prev.map((e) =>
          e._id === experience._id ? { ...e, active: !e.active } : e,
        ),
      );
    } catch {
      toast.error("Failed to update experience");
    }
  };

  const remove = async (experience: LocalExperienceType) => {
    if (!confirm(`Delete "${experience.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/local-experiences/${experience._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setExperiences((prev) => prev.filter((e) => e._id !== experience._id));
      toast.success("Experience deleted");
    } catch {
      toast.error("Failed to delete experience");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Local Experiences Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the Local Experiences shown to visitors
          </p>
        </div>
        <Link href="/admin/local-experiences/new">
          <Button>Add New Experience</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            Loading local experiences...
          </p>
        ) : experiences.length === 0 ? (
          <p className="col-span-full py-8 text-center text-gray-500">
            No local experiences found. Create one to get started.
          </p>
        ) : (
          experiences.map((experience) => (
            <div
              key={experience._id}
              className="group relative overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm transition-all hover:border-black/5 hover:shadow-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                {experience.gallery?.[0] && (
                  <img
                    src={experience.gallery[0]}
                    alt={experience.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {experience.popular && (
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-[#eab657]">
                      <StarIcon className="h-3.5 w-3.5" /> Popular
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      experience.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {experience.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {experience.title}
                  </h3>
                  {experience.price !== undefined && experience.price !== null && (
                    <span className="shrink-0 text-sm font-semibold text-[#2c6e9b]">
                      €{experience.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {experience.category}
                </p>
                {experience.area && (
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {experience.area}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/admin/local-experiences/${experience._id}/edit`}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-black/10 py-2 text-sm font-medium text-[#2c6e9b] hover:bg-[#2c6e9b]/5"
                  >
                    <PencilSquareIcon className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleActive(experience)}
                    className="flex-1 cursor-pointer rounded-xl border border-black/10 py-2 text-sm font-medium text-gray-600 hover:bg-black/5"
                  >
                    {experience.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(experience)}
                    className="cursor-pointer rounded-xl border border-black/10 p-2 text-red-500 hover:bg-red-50"
                    aria-label="Delete experience"
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
