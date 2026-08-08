"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { EXPERIENCE_CATEGORY_OPTIONS, DURATION_OPTIONS } from "@/utils/experienceBadge";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export type LocalExperienceFormState = {
  title: string;
  slug: string;
  category: string;
  area: string;
  shortDescription: string;
  story: string;
  highlights: string[];
  included: string[];
  gallery: string[];
  duration: string;
  durationCategory: string;
  price: string;
  rating: string;
  reviewCount: string;
  meetingPoint: string;
  groupSize: string;
  cancellationPolicy: string;
  mapUrl: string;
  popular: boolean;
  featured: boolean;
  active: boolean;
};

const emptyState: LocalExperienceFormState = {
  title: "",
  slug: "",
  category: "",
  area: "",
  shortDescription: "",
  story: "",
  highlights: [],
  included: [],
  gallery: [],
  duration: "",
  durationCategory: "",
  price: "",
  rating: "",
  reviewCount: "",
  meetingPoint: "",
  groupSize: "",
  cancellationPolicy: "",
  mapUrl: "",
  popular: false,
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
      <label className="block text-sm font-medium text-black/60">
        {label}
      </label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const update = (index: number, value: string) => {
    onChange(items.map((v, i) => (i === index ? value : v)));
  };
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  const add = () => {
    onChange([...items, ""]);
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium text-black/60">
          {label}
        </label>
        <button
          type="button"
          onClick={add}
          className="flex cursor-pointer items-center gap-1 text-xs font-medium text-[#2c6e9b] hover:underline"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              className="flex-1"
              placeholder={placeholder}
              value={item}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="cursor-pointer text-red-500"
              aria-label="Remove"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LocalExperienceForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Partial<LocalExperienceFormState>;
  onSubmit: (form: LocalExperienceFormState) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<LocalExperienceFormState>(() => ({
    ...emptyState,
    ...initial,
  }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
      included: form.included.map((h) => h.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            placeholder="e.g. Port Wine Tasting"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Slug (URL Friendly)"
            required
            placeholder="port-wine-tasting"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <Select
            label="Category"
            required
            placeholder="Select a category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {EXPERIENCE_CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <Input
            label="Area / Neighborhood"
            placeholder="e.g. Vila Nova de Gaia"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        </div>
        <TextArea
          label="Short Description (shown on the listing card)"
          rows={2}
          placeholder="A one-line teaser for the experience card"
          value={form.shortDescription}
          onChange={(v) => setForm({ ...form, shortDescription: v })}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
          Booking Details
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Duration Label"
            placeholder="e.g. 1.5 – 2h"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
          <Select
            label="Duration Bucket (for filtering)"
            placeholder="Select a bucket"
            value={form.durationCategory}
            onChange={(e) => setForm({ ...form, durationCategory: e.target.value })}
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
          <Input
            label="Price (EUR)"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 35"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            label="Rating (0–5, optional)"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="e.g. 4.9"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />
          <Input
            label="Review Count (optional)"
            type="number"
            min="0"
            placeholder="e.g. 312"
            value={form.reviewCount}
            onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
          />
          <Input
            label="Group Size (optional)"
            placeholder="e.g. Max 10 people"
            value={form.groupSize}
            onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
          />
        </div>
        <Input
          label="Meeting Point"
          placeholder="e.g. Ribeira Square, next to the fountain"
          value={form.meetingPoint}
          onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
        />
        <Input
          label="Map Link (optional)"
          placeholder="https://maps.google.com/..."
          value={form.mapUrl}
          onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
        />
        <TextArea
          label="Cancellation Policy"
          rows={2}
          placeholder="e.g. Free cancellation up to 24h before the experience."
          value={form.cancellationPolicy}
          onChange={(v) => setForm({ ...form, cancellationPolicy: v })}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
          Story
        </h2>
        <TextArea
          label="About this experience"
          rows={7}
          placeholder="Describe what makes this experience special..."
          value={form.story}
          onChange={(v) => setForm({ ...form, story: v })}
        />
        <ListEditor
          label="Highlights"
          items={form.highlights}
          onChange={(highlights) => setForm({ ...form, highlights })}
          placeholder="e.g. Taste 4 different Port wines"
        />
        <ListEditor
          label="What's Included"
          items={form.included}
          onChange={(included) => setForm({ ...form, included })}
          placeholder="e.g. Local guide, tastings, bottled water"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
          Photos
        </h2>
        <p className="text-xs text-black/40">
          The first photo is used as the cover image on the listing card and
          detail page hero.
        </p>
        <ImageUploader
          value={form.gallery}
          onChange={(gallery) => setForm({ ...form, gallery })}
          folder="local-experiences"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={form.popular}
            onChange={(e) => setForm({ ...form, popular: e.target.checked })}
            className="h-4 w-4 rounded border-black/20"
          />
          Mark as Popular
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 rounded border-black/20"
          />
          Featured on homepage
        </label>
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
