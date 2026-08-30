"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type StoreFormState = {
  name: string;
  location: string;
  email: string;
  phone: string;
  deliveryFee: string;
  deliveryZonePorto: string;
  deliveryZoneInnerRing: string;
  deliveryZoneOuterRing: string;
  googleMapsLink: string;
  commissionRate: string;
  fulfillmentPin: string;
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
          email: store.email ?? "",
          phone: store.phone ?? "",
          deliveryFee: String(store.deliveryFee ?? 0),
          deliveryZonePorto: String(store.deliveryZoneFees?.porto ?? ""),
          deliveryZoneInnerRing: String(store.deliveryZoneFees?.innerRing ?? ""),
          deliveryZoneOuterRing: String(store.deliveryZoneFees?.outerRing ?? ""),
          googleMapsLink: store.googleMapsLink ?? "",
          commissionRate: String(store.commissionRate ?? 10),
          fulfillmentPin: "",
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
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          deliveryFee: parseFloat(form.deliveryFee) || 0,
          deliveryZoneFees: {
            porto: form.deliveryZonePorto.trim() === "" ? undefined : parseFloat(form.deliveryZonePorto),
            innerRing: form.deliveryZoneInnerRing.trim() === "" ? undefined : parseFloat(form.deliveryZoneInnerRing),
            outerRing: form.deliveryZoneOuterRing.trim() === "" ? undefined : parseFloat(form.deliveryZoneOuterRing),
          },
          googleMapsLink: form.googleMapsLink.trim() || undefined,
          commissionRate: parseFloat(form.commissionRate) || 0,
          fulfillmentPin: form.fulfillmentPin,
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Store Owner Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="owner@example.com"
              />
              <p className="mt-1 text-xs text-gray-400">
                Used to email the store owner about new orders.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Store Owner Phone
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+351 900 000 000"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Google Maps Link
            </label>
            <Input
              value={form.googleMapsLink}
              onChange={(e) =>
                setForm({ ...form, googleMapsLink: e.target.value })
              }
              placeholder="Paste the shop's Google Maps share link"
            />
            <p className="mt-1 text-xs text-gray-400">
              Shown to customers who choose pickup, as a &quot;Get Directions&quot; link.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Zone Fees (€)
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Porto</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deliveryZonePorto}
                  onChange={(e) =>
                    setForm({ ...form, deliveryZonePorto: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Inner AMP</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deliveryZoneInnerRing}
                  onChange={(e) =>
                    setForm({ ...form, deliveryZoneInnerRing: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Outer AMP</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deliveryZoneOuterRing}
                  onChange={(e) =>
                    setForm({ ...form, deliveryZoneOuterRing: e.target.value })
                  }
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Leave a zone blank to use the fallback fee below for it.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fallback Fee (€)
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
              Used for any zone not set above. Kept 100% by the store — commission isn&apos;t taken from delivery.
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fulfillment PIN
            </label>
            <Input
              type="text"
              value={form.fulfillmentPin}
              onChange={(e) =>
                setForm({ ...form, fulfillmentPin: e.target.value })
              }
              placeholder="Leave blank to keep the current PIN"
            />
            <p className="mt-1 text-xs text-gray-400">
              Given to delivery/pickup staff to confirm handoffs — never the
              store&apos;s login code.
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
