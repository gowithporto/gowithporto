"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { value: "ceramics", label: "Ceramics & Azulejos" },
  { value: "port-wine", label: "Port & Wine" },
  { value: "gourmet-food", label: "Gourmet Food & Delicacies" },
  { value: "cork-products", label: "Cork Products" },
  { value: "textiles", label: "Textiles & Clothing" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "home-decor", label: "Home Decor" },
  { value: "stationery", label: "Stationery & Notebooks" },
  { value: "postcards-prints", label: "Postcards & Prints" },
  { value: "magnets-keychains", label: "Magnets & Keychains" },
  { value: "books-maps", label: "Books & Maps" },
  { value: "bags-leather", label: "Bags & Leather Goods" },
  { value: "candles-soaps", label: "Candles & Soaps" },
  { value: "toys-games", label: "Toys & Games" },
  { value: "art-crafts", label: "Art & Handicrafts" },
  { value: "souvenir", label: "General Souvenirs" },
];

const CUSTOM_VALUE = "__custom__";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    price: "",
    category: "",
    images: [] as string[],
    quantity: "",
  });
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const category =
      form.category === CUSTOM_VALUE ? customCategory.trim() : form.category;

    try {
      const res = await fetch("/api/store-owner/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category,
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create product");
      }

      toast.success("Product created");
      router.push("/store-owner/products");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] dark:text-white">
          Add Product
        </h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Add a new item to your store&apos;s catalogue.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="max-w-2xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            placeholder="e.g. Azulejo Ceramic Tile"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Input
            label="Slug (URL Friendly)"
            required
            placeholder="azulejo-ceramic-tile"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />

          <Input
            label="Price (€)"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="12.50"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <Input
            label="Quantity"
            type="number"
            min="0"
            required
            placeholder="50"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60 dark:text-white/60">
            Images
          </label>
          <ImageUploader
            value={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Category"
            required
            placeholder="Select a category"
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
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

          {form.category === CUSTOM_VALUE && (
            <Input
              label="Custom Category"
              required
              placeholder="e.g. Handmade Soaps"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
