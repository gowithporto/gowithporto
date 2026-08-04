"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [categorySelect, setCategorySelect] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/store-owner/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: any) => p._id === id);
        setProduct(found);

        const knownValues = CATEGORY_OPTIONS.map((c) => c.value);
        if (found?.category && !knownValues.includes(found.category)) {
          setCategorySelect(CUSTOM_VALUE);
          setCustomCategory(found.category);
        } else {
          setCategorySelect(found?.category || "");
        }
      });
  }, [id]);

  if (!product) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const category =
      categorySelect === CUSTOM_VALUE ? customCategory.trim() : categorySelect;

    try {
      const res = await fetch(`/api/store-owner/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: product.title,
          price: product.price,
          category,
          images: product.images,
          quantity: product.quantity,
          active: product.active,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update product");
      }

      toast.success("Product updated");
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
        <h1 className="font-serif text-2xl font-bold text-[#1d3d5c] dark:text-white">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Update this item&apos;s details.
        </p>
      </div>

      <form
        onSubmit={save}
        className="max-w-2xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111c27]"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            value={product.title}
            onChange={(e) => setProduct({ ...product, title: e.target.value })}
          />

          <Input
            label="Price (€)"
            type="number"
            min="0"
            step="0.01"
            required
            value={product.price}
            onChange={(e) =>
              setProduct({ ...product, price: Number(e.target.value) })
            }
          />

          <Input
            label="Quantity"
            type="number"
            min="0"
            required
            value={product.quantity || 0}
            onChange={(e) =>
              setProduct({ ...product, quantity: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60 dark:text-white/60">
            Images
          </label>
          <ImageUploader
            value={product.images || []}
            onChange={(images) => setProduct({ ...product, images })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          {categorySelect === CUSTOM_VALUE && (
            <Input
              label="Custom Category"
              required
              placeholder="e.g. Handmade Soaps"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) => setProduct({ ...product, active: e.target.checked })}
          />
          Active
        </label>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
