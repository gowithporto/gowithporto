"use client";

import {
  CheckCircleIcon,
  ChevronLeftIcon,
  HeartIcon as HeartOutline,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import InfoStrip from "@/components/shop/InfoStrip";
import Button from "@/components/ui/Button";
import { useFavorite } from "@/hooks/useFavorite";
import { addToCart } from "@/store/slices/cartSlice";

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  quantity?: number;
  variants?: Variant[];
  storeId?: { name?: string };
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { favorited, toggle: toggleFavorite } = useFavorite("product", product?._id);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setActiveImage(0);
    setQty(1);

    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) setNotFound(true);
        else setProduct(data);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-32 pb-16 text-center">
        <p className="text-lg text-[var(--text)]">Product not found.</p>
        <Link href="/shop" className="text-sm text-[#2c6e9b] hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="grid gap-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:grid-cols-2 lg:px-12">
        <div className="aspect-square animate-pulse rounded-2xl bg-gray-100" />
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="h-10 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const images = product.images?.length ? product.images : [];
  const inStock = (product.quantity || 0) > 0;
  const isStoreOwner = session?.user?.role === "STORE_OWNER";

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: images[0],
        quantity: qty,
        category: product.category,
        storeName: product.storeId?.name,
      }),
    );
    toast.success(`${product.title} added to cart`);
  };

  const addVariantToCart = (variant: Variant) => {
    dispatch(
      addToCart({
        productId: product._id,
        variantId: variant._id,
        variantName: variant.name,
        title: product.title,
        price: variant.price ?? product.price,
        image: variant.image,
        quantity: 1,
        category: product.category,
        storeName: product.storeId?.name,
      }),
    );
    toast.success(`${product.title} — ${variant.name} added to cart`);
  };

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <Link
        href="/shop"
        className="relative z-60 flex w-fit items-center gap-1 text-sm text-[#2c6e9b] hover:underline"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to Shop
      </Link>

      {hasVariants ? (
        <div className="space-y-8">
          <div className="space-y-3">
            {product.category && (
              <span className="inline-block rounded-full bg-[#2c6e9b]/10 px-3 py-1 text-xs font-medium text-[#2c6e9b]">
                {formatLabel(product.category)}
              </span>
            )}
            <h1 className="font-serif text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {product.title}
            </h1>
            {product.storeId?.name && (
              <p className="text-sm text-gray-500">
                Sold by {product.storeId.name}
              </p>
            )}
            {product.description && (
              <p className="text-sm leading-relaxed text-[var(--text)]/80">
                {product.description}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {product.variants!.length} designs to choose from
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {product.variants!.map((variant) => {
              const price = variant.price ?? product.price;
              const stock = variant.quantity || 0;
              const variantInStock = stock > 0;

              return (
                <div
                  key={variant._id}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                    {variant.image && (
                      <img
                        src={variant.image}
                        alt={variant.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="space-y-1 p-3">
                    <h3 className="truncate text-sm font-semibold text-[var(--text)]">
                      {variant.name}
                    </h3>
                    <p className="font-bold text-[var(--text)]">€{price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {variantInStock ? `Available: ${stock}` : "Out of stock"}
                    </p>
                  </div>

                  {!isStoreOwner && (
                    <div className="px-3 pb-3">
                      <Button
                        className="w-full gap-2 cursor-pointer text-xs"
                        disabled={!variantInStock}
                        onClick={() => addVariantToCart(variant)}
                      >
                        <ShoppingCartIcon className="h-3.5 w-3.5" />
                        {variantInStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm">
              {images[activeImage] && (
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={toggleFavorite}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 cursor-pointer"
                aria-label="Save to wishlist"
              >
                {favorited ? (
                  <HeartSolid className="h-5 w-5 text-[#c0392b]" />
                ) : (
                  <HeartOutline className="h-5 w-5 text-[#2c6e9b]" />
                )}
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      activeImage === i ? "border-[#2c6e9b]" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              {product.category && (
                <span className="inline-block rounded-full bg-[#2c6e9b]/10 px-3 py-1 text-xs font-medium text-[#2c6e9b]">
                  {formatLabel(product.category)}
                </span>
              )}
              <h1 className="font-serif text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                {product.title}
              </h1>
              {product.storeId?.name && (
                <p className="text-sm text-gray-500">
                  Sold by {product.storeId.name}
                </p>
              )}
            </div>

            <p className="text-3xl font-bold text-[#2c6e9b]">
              €{product.price.toFixed(2)}
            </p>

            <div
              className={`flex items-center gap-2 text-sm ${
                inStock ? "text-green-600" : "text-red-500"
              }`}
            >
              {inStock ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <XCircleIcon className="h-4 w-4" />
              )}
              {inStock
                ? `In Stock — ${product.quantity} available`
                : "Out of Stock"}
            </div>

            {product.description && (
              <p className="border-t border-black/5 pt-6 text-sm leading-relaxed text-[var(--text)]/80">
                {product.description}
              </p>
            )}

            {!isStoreOwner && (
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center rounded-xl border border-black/10">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-11 w-11 items-center justify-center text-[#2c6e9b] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm">{qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQty((q) => Math.min(product.quantity || q, q + 1))
                    }
                    disabled={!inStock || qty >= (product.quantity || 0)}
                    className="flex h-11 w-11 items-center justify-center text-[#2c6e9b] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  className="flex-1 gap-2 cursor-pointer"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <InfoStrip />
    </div>
  );
}
