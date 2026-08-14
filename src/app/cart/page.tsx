"use client";

import { ChevronLeftIcon, ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import centerLine from "@/assets/center line 3.png";
import CartBanner from "@/components/cart/CartBanner";
import CartItemRow from "@/components/cart/CartItemRow";
import CartTrustList from "@/components/cart/CartTrustList";
import OrderSummary from "@/components/cart/OrderSummary";
import { RootState } from "@/store";
import { clearCart, removeFromCart, updateQuantity } from "@/store/slices/cartSlice";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="pt-32 text-center text-gray-500">Loading cart…</p>;
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[var(--primary)]">Your Cart</h1>
          <Image src={centerLine} alt="" className="mt-2 h-auto w-32" />
          <p className="mt-3 text-sm text-gray-500">
            Review your items and proceed to checkout
          </p>
        </div>

        <Link
          href="/shop"
          className="relative z-60 flex items-center gap-1 text-sm text-[#2c6e9b] hover:underline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
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
        <>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="hidden border-b border-black/5 pb-3 text-xs font-medium tracking-wide text-gray-400 sm:flex">
                  <span className="flex-1">PRODUCT</span>
                  <span className="flex items-center gap-6 sm:gap-10">
                    <span className="w-16">PRICE</span>
                    <span className="w-[88px] text-center">QUANTITY</span>
                    <span className="w-16 text-right">TOTAL</span>
                    <span className="w-4" />
                  </span>
                </div>

                {items.map((item) => (
                  <CartItemRow
                    key={`${item.productId}:${item.variantId ?? ""}`}
                    item={item}
                    onQuantityChange={(quantity) =>
                      dispatch(
                        updateQuantity({
                          productId: item.productId,
                          variantId: item.variantId,
                          quantity,
                        })
                      )
                    }
                    onRemove={() =>
                      dispatch(
                        removeFromCart({
                          productId: item.productId,
                          variantId: item.variantId,
                        })
                      )
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => dispatch(clearCart())}
                className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm text-[#2c6e9b] transition hover:bg-[#2c6e9b]/5 cursor-pointer"
              >
                <TrashIcon className="h-4 w-4" />
                Clear Cart
              </button>
            </div>

            <div className="space-y-6">
              <OrderSummary subtotal={subtotal} />
              <CartTrustList />
            </div>
          </div>

          <CartBanner />
        </>
      )}
    </div>
  );
}
