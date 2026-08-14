"use client";

import { ChevronLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "@/components/ui/LocalizedLink";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import InfoStrip from "@/components/shop/InfoStrip";
import ProductCard from "@/components/shop/ProductCard";
import SortSidebar from "@/components/shop/SortSidebar";
import { slugifyCategory } from "@/lib/slugifyCategory";

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [categoryImage, setCategoryImage] = useState<string | undefined>();
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: { slug: string; image?: string }[]) => {
        const match = Array.isArray(data)
          ? data.find((c) => c.slug === categorySlug)
          : null;
        setCategoryImage(match?.image);
      })
      .catch(() => setCategoryImage(undefined));
  }, [categorySlug]);

  const categoryProducts = useMemo(
    () =>
      products.filter(
        (p) => p.category && slugifyCategory(p.category) === categorySlug,
      ),
    [products, categorySlug],
  );

  const categoryName = categoryProducts[0]?.category
    ? formatLabel(categoryProducts[0].category)
    : formatLabel(String(categorySlug || ""));

  const visibleProducts = useMemo(() => {
    let list = categoryProducts;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.title?.toLowerCase().includes(q));
    }

    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name-asc") list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "name-desc") list.sort((a, b) => b.title.localeCompare(a.title));

    return list;
  }, [categoryProducts, search, sort]);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <div className="space-y-3">
        <Link
          href="/shop"
          className="flex w-fit items-center gap-1 text-sm text-[#2c6e9b] hover:underline"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Shop
        </Link>
        <div className="flex items-center gap-4">
          {categoryImage && (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/5">
              <img
                src={categoryImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="font-serif text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
            {categoryName}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <SortSidebar selected={sort} onSelect={setSort} />
        </aside>

        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white py-3 pr-4 pl-9 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
              />
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <InfoStrip />
    </div>
  );
}
