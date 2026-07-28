"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import CategorySidebar from "@/components/shop/CategorySidebar";
import InfoStrip from "@/components/shop/InfoStrip";
import ProductCard from "@/components/shop/ProductCard";
import ShopAdCard from "@/components/shop/ShopAdCard";
import ShopBanner from "@/components/shop/ShopBanner";
import SortSidebar from "@/components/shop/SortSidebar";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category) continue;
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const visibleProducts = useMemo(() => {
    let list = products;

    if (category) list = list.filter((p) => p.category === category);

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
  }, [products, category, search, sort]);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <ShopBanner />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <CategorySidebar
            categories={categoryCounts}
            totalCount={products.length}
            selected={category}
            onSelect={setCategory}
          />
          <SortSidebar selected={sort} onSelect={setSort} />
          <ShopAdCard />
        </aside>

        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
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
