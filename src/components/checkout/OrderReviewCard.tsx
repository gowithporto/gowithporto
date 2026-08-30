import { LockClosedIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

import centerLine from "@/assets/center line 3.png";

type CartItem = {
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
};

type Props = {
  items: CartItem[];
  subtotal: number;
  deliveryType: "pickup" | "delivery";
  deliveryFee?: number | null;
  quoting?: boolean;
  quoteError?: string | null;
  loading: boolean;
  onSubmit: () => void;
};

export default function OrderReviewCard({
  items,
  subtotal,
  deliveryType,
  deliveryFee = null,
  quoting = false,
  quoteError = null,
  loading,
  onSubmit,
}: Props) {
  const total = subtotal + (deliveryType === "delivery" ? deliveryFee ?? 0 : 0);
  const canSubmit =
    items.length > 0 &&
    !loading &&
    !(deliveryType === "delivery" && (quoting || !!quoteError || deliveryFee === null));

  const shippingLabel =
    deliveryType === "pickup"
      ? "Free"
      : quoting
        ? "Calculating…"
        : quoteError
          ? "Unavailable"
          : deliveryFee !== null
            ? `€${deliveryFee.toFixed(2)}`
            : "Select a delivery area";
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-center font-serif text-xl font-medium text-[var(--primary)]">
        Order Review
      </h2>
      <Image src={centerLine} alt="" className="mx-auto mt-2 h-auto w-24" />

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}:${item.variantId ?? ""}`}
            className="flex items-center gap-3"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text)]">
                {item.title}
              </p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-[var(--text)]">
              €{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-black/10 pt-4 text-sm">
        <div className="flex justify-between text-[var(--text)]">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[var(--text)]">
          <span>Shipping</span>
          <span>{shippingLabel}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
        <span className="font-serif text-lg font-medium text-[var(--primary)]">Total</span>
        <span className="text-lg font-bold text-[#2c6e9b]">€{total.toFixed(2)}</span>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c6e9b] py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-md disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
      >
        <LockClosedIcon className="h-4 w-4" />
        {loading ? "Redirecting…" : "Proceed to Payment"}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Secure checkout powered by <span className="font-medium text-[#2c6e9b]">Stripe</span>
      </p>
    </div>
  );
}
