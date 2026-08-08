"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SingleImagePicker from "@/components/ui/SingleImagePicker";
import { cn } from "@/utils/cn";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "landmark", label: "Landmark" },
  { value: "church", label: "Church & Religious Site" },
  { value: "museum", label: "Museum" },
  { value: "viewpoint", label: "Viewpoint" },
  { value: "bridge", label: "Bridge" },
  { value: "garden-park", label: "Garden & Park" },
  { value: "beach", label: "Beach" },
  { value: "historic-street", label: "Historic Street" },
  { value: "wine-cellar", label: "Wine Cellar" },
  { value: "market", label: "Market" },
];

const CUSTOM_VALUE = "__custom__";

type NearbyPlace = {
  name: string;
  blurb: string;
  image: string;
  externalLink: string;
  distance: string;
  rating: string;
  reviewCount: string;
};

export type AttractionFormState = {
  title: string;
  slug: string;
  category: string;
  area: string;
  shortDescription: string;
  history: string;
  highlights: string[];
  gallery: string[];
  bestTimeToVisit: string;
  openingHours: string;
  entryFee: string;
  howToGetThere: string;
  mapUrl: string;
  nearbyHotels: NearbyPlace[];
  nearbyRestaurants: NearbyPlace[];
  featured: boolean;
  active: boolean;
};

const emptyState: AttractionFormState = {
  title: "",
  slug: "",
  category: "",
  area: "",
  shortDescription: "",
  history: "",
  highlights: [],
  gallery: [],
  bestTimeToVisit: "",
  openingHours: "",
  entryFee: "",
  howToGetThere: "",
  mapUrl: "",
  nearbyHotels: [],
  nearbyRestaurants: [],
  featured: false,
  active: true,
};

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-black/60 dark:text-white/60">
        {label}
      </label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
      />
    </div>
  );
}

function NearbyPlaceEditor({
  title,
  places,
  onChange,
  folder,
}: {
  title: string;
  places: NearbyPlace[];
  onChange: (places: NearbyPlace[]) => void;
  folder: string;
}) {
  const update = (index: number, patch: Partial<NearbyPlace>) => {
    onChange(places.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };
  const remove = (index: number) => {
    onChange(places.filter((_, i) => i !== index));
  };
  const add = () => {
    onChange([
      ...places,
      {
        name: "",
        blurb: "",
        image: "",
        externalLink: "",
        distance: "",
        rating: "",
        reviewCount: "",
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-black/60 dark:text-white/60">
          {title}
        </label>
        <button
          type="button"
          onClick={add}
          className="flex cursor-pointer items-center gap-1 text-xs font-medium text-[#2c6e9b] hover:underline"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {places.map((place, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-3 rounded-xl border border-black/10 p-4 md:grid-cols-2 dark:border-white/10"
        >
          <Input
            label="Name"
            value={place.name}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <Input
            label="Link (optional)"
            placeholder="https://..."
            value={place.externalLink}
            onChange={(e) => update(i, { externalLink: e.target.value })}
          />
          <Input
            label="Distance"
            placeholder="e.g. 0.2 km away"
            value={place.distance}
            onChange={(e) => update(i, { distance: e.target.value })}
          />
          <Input
            label="Rating (0–5, optional)"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="e.g. 4.6"
            value={place.rating}
            onChange={(e) => update(i, { rating: e.target.value })}
          />
          <Input
            label="Review Count (optional)"
            type="number"
            min="0"
            placeholder="e.g. 412"
            value={place.reviewCount}
            onChange={(e) => update(i, { reviewCount: e.target.value })}
          />
          <div className="md:col-span-2">
            <TextArea
              label="Blurb"
              rows={2}
              value={place.blurb}
              onChange={(v) => update(i, { blurb: v })}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="block text-sm font-medium text-black/60 dark:text-white/60">
              Photo
            </label>
            <SingleImagePicker
              value={place.image}
              onChange={(url) => update(i, { image: url })}
              folder={folder}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-red-500 hover:underline"
            >
              <TrashIcon className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function normalizePlace(p: Partial<NearbyPlace> | undefined): NearbyPlace {
  return {
    name: p?.name ?? "",
    blurb: p?.blurb ?? "",
    image: p?.image ?? "",
    externalLink: p?.externalLink ?? "",
    distance: p?.distance ?? "",
    rating: p?.rating === undefined || p?.rating === null ? "" : String(p.rating),
    reviewCount:
      p?.reviewCount === undefined || p?.reviewCount === null
        ? ""
        : String(p.reviewCount),
  };
}

export default function AttractionForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Partial<AttractionFormState>;
  onSubmit: (form: AttractionFormState) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<AttractionFormState>(() => ({
    ...emptyState,
    ...initial,
    nearbyHotels: (initial?.nearbyHotels ?? []).map(normalizePlace),
    nearbyRestaurants: (initial?.nearbyRestaurants ?? []).map(normalizePlace),
  }));
  const isCustomCategory =
    !!form.category && !CATEGORY_OPTIONS.some((c) => c.value === form.category);
  const [customCategory, setCustomCategory] = useState(
    isCustomCategory ? form.category : ""
  );
  const [categorySelect, setCategorySelect] = useState(
    isCustomCategory ? CUSTOM_VALUE : form.category
  );

  const updateHighlight = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.map((h, i) => (i === index ? value : h)),
    }));
  };
  const removeHighlight = (index: number) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.filter((_, i) => i !== index),
    }));
  };
  const addHighlight = () => {
    setForm((f) => ({ ...f, highlights: [...f.highlights, ""] }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const category =
      categorySelect === CUSTOM_VALUE ? customCategory.trim() : categorySelect;

    const cleanPlaces = (places: NearbyPlace[]) =>
      places.map((p) => ({
        ...p,
        rating: p.rating === "" ? undefined : Number(p.rating),
        reviewCount: p.reviewCount === "" ? undefined : Number(p.reviewCount),
      }));

    onSubmit({
      ...form,
      category,
      highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
      nearbyHotels: cleanPlaces(form.nearbyHotels) as any,
      nearbyRestaurants: cleanPlaces(form.nearbyRestaurants) as any,
    });
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            placeholder="e.g. Dom Luís I Bridge"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Slug (URL Friendly)"
            required
            placeholder="dom-luis-bridge"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <Select
            label="Category"
            required
            placeholder="Select a category"
            value={categorySelect}
            onChange={(e) => {
              setCategorySelect(e.target.value);
              if (e.target.value !== CUSTOM_VALUE) setCustomCategory("");
            }}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
            <option value={CUSTOM_VALUE}>Other (add your own)</option>
          </Select>
          {categorySelect === CUSTOM_VALUE ? (
            <Input
              label="Custom Category"
              required
              placeholder="e.g. Riverside"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          ) : (
            <Input
              label="Area / Neighborhood"
              placeholder="e.g. Ribeira"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
          )}
        </div>
        {categorySelect === CUSTOM_VALUE && (
          <Input
            label="Area / Neighborhood"
            placeholder="e.g. Ribeira"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        )}
        <TextArea
          label="Short Description (shown on the listing card)"
          rows={2}
          placeholder="A one-line teaser for the attraction card"
          value={form.shortDescription}
          onChange={(v) => setForm({ ...form, shortDescription: v })}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
          Story
        </h2>
        <TextArea
          label="History / Why it's famous"
          rows={7}
          placeholder="Tell the story of this place..."
          value={form.history}
          onChange={(v) => setForm({ ...form, history: v })}
        />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-black/60 dark:text-white/60">
              Highlights
            </label>
            <button
              type="button"
              onClick={addHighlight}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-[#2c6e9b] hover:underline"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {form.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="e.g. Best sunset view of the Douro"
                  value={h}
                  onChange={(e) => updateHighlight(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="cursor-pointer text-red-500"
                  aria-label="Remove highlight"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
          Visitor Info
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Best Time to Visit"
            placeholder="e.g. Apr – Oct"
            value={form.bestTimeToVisit}
            onChange={(e) => setForm({ ...form, bestTimeToVisit: e.target.value })}
          />
          <Input
            label="Opening Hours"
            placeholder="e.g. 24 Hours"
            value={form.openingHours}
            onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
          />
          <Input
            label="Entry Fee"
            placeholder="e.g. Free"
            value={form.entryFee}
            onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
          />
        </div>
        <TextArea
          label="How to Get There"
          rows={2}
          placeholder="e.g. 10 min walk from São Bento Station or take bus 500/501."
          value={form.howToGetThere}
          onChange={(v) => setForm({ ...form, howToGetThere: v })}
        />
        <Input
          label="Map Link (optional)"
          placeholder="https://maps.google.com/..."
          value={form.mapUrl}
          onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
          Photos
        </h2>
        <p className="text-xs text-black/40 dark:text-white/40">
          The first photo is used as the cover image on the listing card and
          detail page hero.
        </p>
        <ImageUploader
          value={form.gallery}
          onChange={(gallery) => setForm({ ...form, gallery })}
          folder="attractions"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
          Nearby
        </h2>
        <NearbyPlaceEditor
          title="Nearby Hotels"
          places={form.nearbyHotels}
          onChange={(nearbyHotels) => setForm({ ...form, nearbyHotels })}
          folder="attractions/hotels"
        />
        <NearbyPlaceEditor
          title="Nearby Restaurants"
          places={form.nearbyRestaurants}
          onChange={(nearbyRestaurants) => setForm({ ...form, nearbyRestaurants })}
          folder="attractions/restaurants"
        />
      </div>

      <div className="flex items-center gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)] dark:text-white/80">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 rounded border-black/20"
          />
          Featured on homepage
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)] dark:text-white/80">
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
