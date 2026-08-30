"use client";

import {
  BuildingStorefrontIcon,
  ChevronLeftIcon,
  ShoppingBagIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import centerLine from "@/assets/center line 3.png";
import OrderReviewCard from "@/components/checkout/OrderReviewCard";
import Input from "@/components/ui/Input";
import { AMP_MUNICIPALITIES } from "@/lib/deliveryZones";
import { RootState } from "@/store";

type Address = {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

const REQUIRED_FIELDS: (keyof Address)[] = [
  "name",
  "street",
  "city",
  "postalCode",
  "country",
];

type StoreInfo = {
  name: string;
  location: string;
  googleMapsLink: string | null;
};

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const cart = useSelector((state: RootState) => state.cart.items);

  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const [address, setAddress] = useState<Address>({
    name: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Portugal",
  });

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cart.length === 0) return;

    fetch("/api/checkout/store-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStoreInfo(data))
      .catch(() => setStoreInfo(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  useEffect(() => {
    if (deliveryType !== "delivery" || !address.city) {
      setDeliveryFee(null);
      setQuoteError(null);
      return;
    }

    setQuoting(true);
    setQuoteError(null);

    fetch("/api/delivery/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, city: address.city }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to quote delivery fee");
        setDeliveryFee(data.fee);
      })
      .catch((err) => {
        setDeliveryFee(null);
        setQuoteError(err.message);
      })
      .finally(() => setQuoting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryType, address.city]);

  if (!mounted) {
    return <p className="pt-32 text-center text-gray-500">Loading checkout…</p>;
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (deliveryType === "delivery") {
      const nextErrors: Partial<Record<keyof Address, string>> = {};
      for (const field of REQUIRED_FIELDS) {
        if (!address[field].trim()) nextErrors[field] = "Required";
      }
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
      if (quoting || quoteError || deliveryFee === null) return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          deliveryType,
          address: deliveryType === "delivery" ? address : null,
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[var(--primary)]">Checkout</h1>
          <Image src={centerLine} alt="" className="mt-2 h-auto w-32" />
          <p className="mt-3 text-sm text-gray-500">
            Choose delivery and confirm your order
          </p>
        </div>

        <Link
          href="/cart"
          className="relative z-60 flex items-center gap-1 text-sm text-[#2c6e9b] hover:underline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white py-20 text-center shadow-sm">
          <ShoppingBagIcon className="h-12 w-12 text-[#2c6e9b]/40" />
          <p className="text-[var(--text)]">Your cart is empty.</p>
          <Link
            href="/shop"
            className="rounded-xl bg-[#2c6e9b] px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[var(--text)]">Delivery Method</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    deliveryType === "pickup"
                      ? "border-[#2c6e9b] bg-[#2c6e9b]/5"
                      : "border-black/10 hover:border-black/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === "pickup"}
                    onChange={() => setDeliveryType("pickup")}
                    className="sr-only"
                  />
                  <BuildingStorefrontIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2c6e9b]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">
                      Pick up from store
                    </p>
                    <p className="text-xs text-gray-500">Collect your order in person</p>
                    {deliveryType === "pickup" && storeInfo && (
                      <p className="mt-1 text-xs text-gray-600">
                        {storeInfo.name}
                        {storeInfo.googleMapsLink && (
                          <>
                            {" — "}
                            <a
                              href={storeInfo.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2c6e9b] underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Get Directions
                            </a>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-green-600">Free</span>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    deliveryType === "delivery"
                      ? "border-[#2c6e9b] bg-[#2c6e9b]/5"
                      : "border-black/10 hover:border-black/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={deliveryType === "delivery"}
                    onChange={() => setDeliveryType("delivery")}
                    className="sr-only"
                  />
                  <TruckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2c6e9b]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">Delivery</p>
                    <p className="text-xs text-gray-500">Shipped to your address</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Fee applies</span>
                </label>
              </div>
            </div>

            {deliveryType === "delivery" && (
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-[var(--text)]">Delivery Address</h2>

                <div className="mt-4 space-y-4">
                  <div>
                    <Input
                      label="Full Name"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Street Address"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                    {errors.street && (
                      <p className="mt-1 text-xs text-red-500">{errors.street}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">City</label>
                      <select
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-[var(--text)]"
                      >
                        <option value="">Select your area</option>
                        {AMP_MUNICIPALITIES.map((zone) => (
                          <optgroup key={zone.id} label={zone.label}>
                            {zone.municipalities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                      )}
                      {quoteError && (
                        <p className="mt-1 text-xs text-red-500">
                          Sorry, we don&apos;t deliver to that area.
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="Postal Code"
                        value={address.postalCode}
                        onChange={(e) =>
                          setAddress({ ...address, postalCode: e.target.value })
                        }
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    />
                    {errors.country && (
                      <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <OrderReviewCard
            items={cart}
            subtotal={subtotal}
            deliveryType={deliveryType}
            deliveryFee={deliveryFee}
            quoting={quoting}
            quoteError={quoteError}
            loading={loading}
            onSubmit={handleCheckout}
          />
        </div>
      )}
    </div>
  );
}
