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
  category?: string;
  quantity?: number;
  variants?: Variant[];
  storeId?: { name?: string };
};

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { favorited, toggle } = useFavorite("product", product._id);
  const shopEnabled = isShopEnabled();

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
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={thumbnail}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
      </div>

      <div className="space-y-1 p-4">
        <h3 className="font-semibold text-[var(--text)]">{product.title}</h3>
        <p className="text-sm text-gray-500 capitalize">
          {product.category || product.storeId?.name}
        </p>
        <p className="font-bold text-[var(--text)]">
          {pricesDiffer ? `From €${minVariantPrice}` : `€${minVariantPrice}`}
        </p>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500">
            {hasVariants
              ? `${product.variants!.length} designs available`
              : `Available: ${product.quantity || 0}`}
          </p>
          {shopEnabled ? (
            <Link
              href={`/shop/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium whitespace-nowrap text-[#2c6e9b] hover:underline"
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
              className="cursor-pointer text-xs font-medium whitespace-nowrap text-[#2c6e9b] hover:underline"
            >
              See Details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
