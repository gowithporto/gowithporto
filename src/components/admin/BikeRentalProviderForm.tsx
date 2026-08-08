"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SingleImagePicker from "@/components/ui/SingleImagePicker";
import { useState } from "react";

export type BikeRentalProviderFormState = {
  name: string;
  coverImage: string;
  address: string;
  googleMapsUrl: string;
  startingPrice: string;
  rating: string;
  reviewCount: string;
  order: string;
  active: boolean;
};

const emptyState: BikeRentalProviderFormState = {
  name: "",
  coverImage: "",
  address: "",
  googleMapsUrl: "",
  startingPrice: "",
  rating: "",
  reviewCount: "",
  order: "",
  active: true,
};

function normalizeInitial(
  initial?: Partial<{
    name: string;
    coverImage: string;
    address: string;
    googleMapsUrl: string;
    startingPrice: string;
    rating: number | string;
    reviewCount: number | string;
    order: number | string;
    active: boolean;
  }>
): BikeRentalProviderFormState {
  return {
    ...emptyState,
    ...initial,
    rating:
      initial?.rating === undefined || initial?.rating === null
        ? ""
        : String(initial.rating),
    reviewCount:
      initial?.reviewCount === undefined || initial?.reviewCount === null
        ? ""
        : String(initial.reviewCount),
    order:
      initial?.order === undefined || initial?.order === null
        ? ""
        : String(initial.order),
  };
}

export default function BikeRentalProviderForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Partial<{
    name: string;
    coverImage: string;
    address: string;
    googleMapsUrl: string;
    startingPrice: string;
    rating: number | string;
    reviewCount: number | string;
    order: number | string;
    active: boolean;
  }>;
  onSubmit: (form: {
    name: string;
    coverImage: string;
    address: string;
    googleMapsUrl: string;
    startingPrice: string;
    rating?: number;
    reviewCount?: number;
    order?: number;
    active: boolean;
  }) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<BikeRentalProviderFormState>(() =>
    normalizeInitial(initial)
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      coverImage: form.coverImage,
      address: form.address,
      googleMapsUrl: form.googleMapsUrl,
      startingPrice: form.startingPrice,
      rating: form.rating === "" ? undefined : Number(form.rating),
      reviewCount:
        form.reviewCount === "" ? undefined : Number(form.reviewCount),
      order: form.order === "" ? undefined : Number(form.order),
      active: form.active,
    });
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
          Shop Details
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Shop Name"
            required
            placeholder="e.g. Porto Bike Rentals"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Address / Area"
            placeholder="e.g. Ribeira, Porto"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Input
            label="Google Maps Link"
            required
            placeholder="https://maps.google.com/..."
            value={form.googleMapsUrl}
            onChange={(e) =>
              setForm({ ...form, googleMapsUrl: e.target.value })
            }
          />
          <Input
            label="Starting Price (optional)"
            placeholder="e.g. From €10/day"
            value={form.startingPrice}
            onChange={(e) =>
              setForm({ ...form, startingPrice: e.target.value })
            }
          />
          <Input
            label="Rating (0–5, optional)"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="e.g. 4.6"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />
          <Input
            label="Review Count (optional)"
            type="number"
            min="0"
            placeholder="e.g. 128"
            value={form.reviewCount}
            onChange={(e) =>
              setForm({ ...form, reviewCount: e.target.value })
            }
          />
          <Input
            label="Display Order (optional)"
            type="number"
            placeholder="0"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
          Photo
        </h2>
        <p className="text-xs text-black/40">
          Shown on the shop&apos;s listing card.
        </p>
        <SingleImagePicker
          value={form.coverImage}
          onChange={(coverImage) => setForm({ ...form, coverImage })}
          folder="bike-rentals"
        />
      </div>

      <div className="flex items-center gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 rounded border-black/20"
          />
          Active (visible to visitors)
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
