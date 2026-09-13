"use client";

import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Link from "@/components/ui/LocalizedLink";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useFavorite } from "@/hooks/useFavorite";
import { isShopEnabled } from "@/lib/marketplace";

type Variant = {
  _id: string;
  name: string;
  image?: string;
  price?: number;
  quantity?: number;
};

type Product = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
  overlayColor?: string;
  category?: string;
  quantity?: number;
  variants?: Variant[];
  storeId?: { name?: string };
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { favorited, toggle } = useFavorite("product", product._id);
  const shopEnabled = isShopEnabled();
  const overlayColor = product.overlayColor || "#1d3d5c";

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const variantPrices = hasVariants
    ? product.variants!.map((v) => v.price ?? product.price)
    : [];
  const minVariantPrice = hasVariants ? Math.min(...variantPrices) : product.price;
  const pricesDiffer = hasVariants && variantPrices.some((p) => p !== minVariantPrice);
  const thumbnail = hasVariants
    ? product.variants!.find((v) => v.image)?.image
    : product.images?.[0];

  const notifyComingSoon = () =>
    toast("Buying is coming soon — browsing only for now!");

  const goToDetails = () => {
    if (shopEnabled) {
      router.push(`/shop/${product.slug}`);
    } else {
      notifyComingSoon();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetails();
        }
      }}
      className="group relative block h-112 w-full cursor-pointer overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
    >
      <img
        src={thumbnail}
        alt={product.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
        style={{
          background: `linear-gradient(to top, ${overlayColor} 0%, ${overlayColor}cc 35%, ${overlayColor}33 65%, transparent 100%)`,
        }}
      />

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 cursor-pointer"
        aria-label="Save to wishlist"
      >
        {favorited ? (
          <HeartSolid className="h-4 w-4 text-[#c0392b]" />
        ) : (
          <HeartOutline className="h-4 w-4 text-[#2c6e9b]" />
        )}
      </button>

      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5">
        <h3 className="font-serif text-lg font-semibold text-white drop-shadow-sm">
          {product.title}
        </h3>
        <p className="text-sm text-white/70 capitalize">
          {product.category || product.storeId?.name}
        </p>
        <p className="text-lg font-bold text-white">
          {pricesDiffer ? `From €${minVariantPrice}` : `€${minVariantPrice}`}
        </p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-white/70">
            {hasVariants
              ? `${product.variants!.length} designs available`
              : `Available: ${product.quantity || 0}`}
          </p>
          {shopEnabled ? (
            <Link
              href={`/shop/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white backdrop-blur-sm transition group-hover:bg-white/25"
            >
              See Details →
            </Link>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                notifyComingSoon();
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white backdrop-blur-sm transition group-hover:bg-white/25"
            >
              See Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
