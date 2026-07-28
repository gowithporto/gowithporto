"use client";

import { HeartIcon as HeartOutline, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";

import Button from "@/components/ui/Button";
import { addToCart } from "@/store/slices/cartSlice";

type Product = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
  category?: string;
  quantity?: number;
  storeId?: { name?: string };
};

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0]}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setSaved((s) => !s);
            }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 cursor-pointer"
            aria-label="Save to wishlist"
          >
            {saved ? (
              <HeartSolid className="h-4 w-4 text-[#c0392b]" />
            ) : (
              <HeartOutline className="h-4 w-4 text-[#2c6e9b]" />
            )}
          </button>
        </div>

        <div className="space-y-1 p-4">
          <h3 className="font-semibold text-[var(--text)]">{product.title}</h3>
          <p className="text-sm text-gray-500 capitalize">
            {product.category || product.storeId?.name}
          </p>
          <p className="font-bold text-[var(--text)]">€{product.price}</p>
          <p className="text-xs text-gray-500">
            Available: {product.quantity || 0}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        {session?.user?.role !== "STORE_OWNER" && (
          <Button
            className="w-full gap-2"
            disabled={!product.quantity}
            onClick={() =>
              dispatch(
                addToCart({
                  productId: product._id,
                  title: product.title,
                  price: product.price,
                  image: product.images?.[0],
                  quantity: 1,
                }),
              )
            }
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}
