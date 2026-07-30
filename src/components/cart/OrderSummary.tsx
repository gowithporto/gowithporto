import { LockClosedIcon, TruckIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

import centerLine from "@/assets/center line 3.png";

const FREE_SHIPPING_THRESHOLD = 50;

type Props = {
  subtotal: number;
  shipping: number;
};

export default function OrderSummary({ subtotal, shipping }: Props) {
  const total = subtotal + shipping;
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-center font-serif text-xl text-[var(--primary)]">
        Order Summary
      </h2>
      <Image src={centerLine} alt="" className="mx-auto mt-2 h-auto w-24" />

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-[var(--text)]">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[var(--text)]">
          <span>Shipping</span>
          <span>€{shipping.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
        <span className="font-serif text-lg text-[var(--primary)]">Total</span>
        <span className="text-lg font-bold text-[#2c6e9b]">
          €{total.toFixed(2)}
        </span>
      </div>

      {!qualifiesForFreeShipping && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#2c6e9b]/10 px-4 py-3 text-sm text-[#2c6e9b]">
          <TruckIcon className="h-4 w-4 flex-shrink-0" />
          Free shipping on orders over €{FREE_SHIPPING_THRESHOLD}!
        </div>
      )}

      <Link href="/checkout">
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c6e9b] py-3 text-sm font-medium text-white transition hover:scale-[1.02] hover:shadow-md cursor-pointer"
        >
          <LockClosedIcon className="h-4 w-4" />
          Proceed to Checkout
        </button>
      </Link>

      <p className="mt-3 text-center text-xs text-gray-500">
        Secure checkout powered by{" "}
        <span className="font-medium text-[#2c6e9b]">Stripe</span>
      </p>
    </div>
  );
}
