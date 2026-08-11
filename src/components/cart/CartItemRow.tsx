"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type CartItem = {
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  category?: string;
  storeName?: string;
};

type Props = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export default function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-black/5 py-5 last:border-b-0 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-4">
        <img
          src={item.image}
          alt={item.title}
          className="h-18 w-18 flex-shrink-0 rounded-xl object-cover"
        />
        <div className="space-y-1">
          <p className="font-semibold text-[var(--text)]">{item.title}</p>
          {item.variantName && (
            <p className="text-sm text-gray-500">{item.variantName}</p>
          )}
          {item.storeName && (
            <p className="text-sm text-gray-500">{item.storeName}</p>
          )}
          {item.category && (
            <span className="inline-block rounded-full bg-[#2c6e9b]/10 px-2 py-0.5 text-xs text-[#2c6e9b]">
              {formatLabel(item.category)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end sm:gap-10">
        <p className="w-16 text-sm text-[var(--text)] sm:text-center">
          €{item.price.toFixed(2)}
        </p>

        <div className="flex items-center rounded-xl border border-black/10">
          <button
            type="button"
            onClick={() => onQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="flex h-8 w-8 items-center justify-center text-[#2c6e9b] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="flex h-8 w-8 items-center justify-center text-[#2c6e9b] cursor-pointer"
            aria-label="Increase quantity"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="w-16 text-right font-semibold text-[var(--text)]">
          €{(item.price * item.quantity).toFixed(2)}
        </p>

        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 transition hover:text-red-500 cursor-pointer"
          aria-label="Remove item"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
