"use client";

import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminEditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: any) => p._id === id);
        if (!found) setNotFound(true);
        setProduct(found);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <p className="text-sm text-red-500">Product not found.</p>;
  }

  if (!product) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
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
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sold by {product.storeId?.name || "—"}
        </p>
      </div>

      <form
        onSubmit={save}
        className="max-w-2xl space-y-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm"
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
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
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

          <Input
            label="Category"
            value={product.category || ""}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Details
          </label>
          <textarea
            rows={4}
            placeholder="What is this, what's it made of, why would someone want it..."
            value={product.description || ""}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-gray-800 focus:border-[#2c6e9b] focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            Shown on this product&apos;s shop page.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Images
          </label>
          <ImageUploader
            value={product.images || []}
            onChange={(images) => setProduct({ ...product, images })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) => setProduct({ ...product, active: e.target.checked })}
          />
          Active
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
