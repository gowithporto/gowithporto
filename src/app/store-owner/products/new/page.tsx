"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import { slugifyCategory } from "@/lib/slugifyCategory";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

type CategoryOption = { name: string; slug: string; image?: string };

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    quantity: "",
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryImage, setCategoryImage] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const matchedCategory = useMemo(() => {
    const slug = slugifyCategory(form.category);
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [form.category, categories]);

  const isNewCategory = form.category.trim().length > 0 && !matchedCategory;

  // Load the matched category's current image into the editable box
  // whenever the typed name resolves to a (possibly different) existing
  // category — but don't clobber an in-progress upload.
  useEffect(() => {
    setCategoryImage(matchedCategory?.image ? [matchedCategory.image] : []);
  }, [matchedCategory?.slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryName = form.category.trim();

    if (categoryName && !categoryImage[0]) {
      toast.error("Add an image for this category");
      return;
    }

    setSaving(true);

    try {
      if (isNewCategory) {
        await fetch("/api/store-owner/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryName, image: categoryImage[0] }),
        });
      } else if (
        matchedCategory &&
        categoryImage[0] &&
        categoryImage[0] !== matchedCategory.image
      ) {
        await fetch("/api/store-owner/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: matchedCategory.slug,
            image: categoryImage[0],
          }),
        });
      }

      const res = await fetch("/api/store-owner/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: categoryName,
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
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c]">
          Add Product
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Add a new item to your store&apos;s catalogue.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="max-w-2xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
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
          <label className="mb-1 block text-sm font-medium text-black/60">
            Details
          </label>
          <textarea
            rows={4}
            placeholder="What is this, what's it made of, why would someone want it..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-black/80 focus:border-[#2c6e9b] focus:outline-none"
          />
          <p className="mt-1 text-xs text-black/40">
            Shown on this product&apos;s shop page.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            Images
          </label>
          <ImageUploader
            value={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
        </div>

        <div>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <Input
                label="Category"
                required
                placeholder="e.g. Postcards & Prints"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="shrink-0">
              <label className="mb-1 block text-sm font-medium text-black/60">
                Image
              </label>
              <ImageUploader
                value={categoryImage}
                onChange={(images) => setCategoryImage(images.slice(-1))}
              />
            </div>
          </div>

          <p className="mt-1 text-xs text-black/40">
            {matchedCategory
              ? "Existing category — change the image here to update it everywhere it appears."
              : isNewCategory
                ? "New category — add an image to represent it in the shop."
                : "Use the same spelling as an existing category to group this product with it in the shop."}
          </p>
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
