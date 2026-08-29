"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CurrencyEuroIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const MIN_PRICE = 0.5;
const MAX_PRICE = 10;
const MIN_CREDITS = 1;
const MAX_CREDITS = 100;

export default function CreditPricingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState("5.00");
  const [creditsPerPurchase, setCreditsPerPurchase] = useState("5");

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/admin/credit-pricing");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPrice((data.priceCents / 100).toFixed(2));
        setCreditsPerPurchase(String(data.creditsPerPurchase));
      } catch {
        toast.error("Failed to load credit pricing");
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue < MIN_PRICE || priceValue > MAX_PRICE) {
      toast.error(`Price must be between €${MIN_PRICE.toFixed(2)} and €${MAX_PRICE.toFixed(2)}`);
      return;
    }

    const creditsValue = Number(creditsPerPurchase);
    if (
      !Number.isInteger(creditsValue) ||
      creditsValue < MIN_CREDITS ||
      creditsValue > MAX_CREDITS
    ) {
      toast.error(`Credits per purchase must be a whole number between ${MIN_CREDITS} and ${MAX_CREDITS}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/credit-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceCents: Math.round(priceValue * 100),
          creditsPerPurchase: creditsValue,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Credit pricing updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading pricing...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
          <CurrencyEuroIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credit Pricing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set what buyers pay for a batch of AI credits — useful for running
            time-limited promotions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price (EUR)
            </label>
            <Input
              type="number"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Allowed range: €{MIN_PRICE.toFixed(2)} – €{MAX_PRICE.toFixed(2)}.
              Stripe rejects card charges below €{MIN_PRICE.toFixed(2)}, so
              that's enforced as a hard floor here too.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Credits per purchase
            </label>
            <Input
              type="number"
              min={MIN_CREDITS}
              max={MAX_CREDITS}
              step={1}
              value={creditsPerPurchase}
              onChange={(e) => setCreditsPerPurchase(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Allowed range: {MIN_CREDITS} – {MAX_CREDITS} credits per
              purchase.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Pricing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
