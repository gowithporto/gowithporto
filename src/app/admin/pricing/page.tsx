"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CurrencyEuroIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const MIN_PRICE = 0.5;
const MAX_PRICE = 10;
const MIN_CREDITS = 1;
const MAX_CREDITS = 100;
const MAX_MIN_ORDER = 1000;

export default function PricingPage() {
  const [creditLoading, setCreditLoading] = useState(true);
  const [creditSaving, setCreditSaving] = useState(false);
  const [price, setPrice] = useState("5.00");
  const [creditsPerPurchase, setCreditsPerPurchase] = useState("5");

  const [minOrderLoading, setMinOrderLoading] = useState(true);
  const [minOrderSaving, setMinOrderSaving] = useState(false);
  const [minOrder, setMinOrder] = useState("0.00");

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
        setCreditLoading(false);
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    const fetchMinOrder = async () => {
      try {
        const res = await fetch("/api/admin/shop-pricing");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setMinOrder((data.minOrderCents / 100).toFixed(2));
      } catch {
        toast.error("Failed to load minimum order amount");
      } finally {
        setMinOrderLoading(false);
      }
    };
    fetchMinOrder();
  }, []);

  const handleSaveCredits = async (e: React.FormEvent) => {
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

    setCreditSaving(true);
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
      setCreditSaving(false);
    }
  };

  const handleSaveMinOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const minOrderValue = Number(minOrder);
    if (!Number.isFinite(minOrderValue) || minOrderValue < 0 || minOrderValue > MAX_MIN_ORDER) {
      toast.error(`Minimum order must be between €0.00 and €${MAX_MIN_ORDER.toFixed(2)}`);
      return;
    }

    setMinOrderSaving(true);
    try {
      const res = await fetch("/api/admin/shop-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minOrderCents: Math.round(minOrderValue * 100),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Minimum order amount updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update minimum order amount");
    } finally {
      setMinOrderSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage what buyers pay across AI credits and shop orders.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <CurrencyEuroIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Credit Pricing</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set what buyers pay for a batch of AI credits — useful for running
              time-limited promotions.
            </p>
          </div>
        </div>

        {creditLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading credit pricing...
          </div>
        ) : (
          <form
            onSubmit={handleSaveCredits}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
          >
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
              <Button type="submit" disabled={creditSaving}>
                {creditSaving ? "Saving..." : "Save Pricing"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
            <ShoppingBagIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Purchase Minimum
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Block checkout for shop carts below this total — below-cost orders
              can lose money after Stripe's fees are taken out.
            </p>
          </div>
        </div>

        {minOrderLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Loading minimum order amount...
          </div>
        ) : (
          <form
            onSubmit={handleSaveMinOrder}
            className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
          >
            <div className="max-w-xs">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum order amount (EUR)
              </label>
              <Input
                type="number"
                min={0}
                max={MAX_MIN_ORDER}
                step={0.01}
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">
                Applies to the product subtotal only (excludes delivery fee).
                Set to €0.00 to disable — buyers below the minimum see a toast
                asking them to add more to their cart.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={minOrderSaving}>
                {minOrderSaving ? "Saving..." : "Save Minimum"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
