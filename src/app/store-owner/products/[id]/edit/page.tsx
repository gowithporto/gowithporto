"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import { slugifyCategory } from "@/lib/slugifyCategory";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

type CategoryOption = { name: string; slug: string; image?: string };

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryImage, setCategoryImage] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/store-owner/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: any) => p._id === id);
        setProduct(found);
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const matchedCategory = useMemo(() => {
    const slug = slugifyCategory(product?.category || "");
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [product?.category, categories]);

  const isNewCategory =
    (product?.category || "").trim().length > 0 && !matchedCategory;

  // Load the matched category's current image into the editable box
  // whenever the product's category resolves to a (possibly different)
  // existing category — but don't clobber an in-progress upload.
  useEffect(() => {
    setCategoryImage(matchedCategory?.image ? [matchedCategory.image] : []);
  }, [matchedCategory?.slug]);

  if (!product) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    const category = (product.category || "").trim();

    if (category && !categoryImage[0]) {
      toast.error("Add an image for this category");
      return;
    }

    setSaving(true);

    try {
      if (isNewCategory) {
        await fetch("/api/store-owner/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: category, image: categoryImage[0] }),
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
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c]">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Update this item&apos;s details.
        </p>
      </div>

      <form
        onSubmit={save}
        className="max-w-2xl space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
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
          <label className="mb-1 block text-sm font-medium text-black/60">
            Images
          </label>
          <ImageUploader
            value={product.images || []}
            onChange={(images) => setProduct({ ...product, images })}
          />
        </div>

        <div>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <Input
                label="Category"
                required
                placeholder="e.g. Postcards & Prints"
                value={product.category || ""}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
                }
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

        <label className="flex items-center gap-2 text-sm text-black/70">
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
