"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type StoreFormState = {
  name: string;
  location: string;
  deliveryFee: string;
  commissionRate: string;
};

export default function EditStorePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<StoreFormState | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/stores/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((store) =>
        setForm({
          name: store.name,
          location: store.location,
          deliveryFee: String(store.deliveryFee ?? 0),
          commissionRate: String(store.commissionRate ?? 10),
        })
      )
      .catch(() => setNotFound(true));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          deliveryFee: parseFloat(form.deliveryFee) || 0,
          commissionRate: parseFloat(form.commissionRate) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update store");

      toast.success("Store updated");
      router.push("/admin/stores");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return <p className="text-sm text-red-500">Store not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Store</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update this store&apos;s details, delivery fee, and commission rate.
        </p>
      </div>

      {form && (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl space-y-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Store Name
            </label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <Input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Fee (€)
            </label>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.deliveryFee}
              onChange={(e) =>
                setForm({ ...form, deliveryFee: e.target.value })
              }
            />
            <p className="mt-1 text-xs text-gray-400">
              Kept 100% by the store — commission isn&apos;t taken from delivery.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Commission Rate (%)
            </label>
            <Input
              required
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.commissionRate}
              onChange={(e) =>
                setForm({ ...form, commissionRate: e.target.value })
              }
            />
            <p className="mt-1 text-xs text-gray-400">
              Platform&apos;s cut of each product sale (not delivery).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/stores")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
