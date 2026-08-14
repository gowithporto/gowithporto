"use client";

import { useEffect, useMemo, useState } from "react";

import CategoryCard from "@/components/shop/CategoryCard";
import InfoStrip from "@/components/shop/InfoStrip";
import ShopAdCard from "@/components/shop/ShopAdCard";
import ShopBanner from "@/components/shop/ShopBanner";
import { slugifyCategory } from "@/lib/slugifyCategory";
import { useLanguage } from "@/providers/LanguageProvider";

type Category = { name: string; slug: string; image?: string };

export default function ShopPage() {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`/api/products?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [lang]);

  const categoryTiles = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category) continue;
      const slug = slugifyCategory(p.category);
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }

    return categories
      .map((c) => ({ ...c, count: counts.get(c.slug) || 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, products]);

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <ShopBanner />

      {categoryTiles.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          No products yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {categoryTiles.map((c) => (
            <CategoryCard
              key={c.slug}
              name={c.name}
              slug={c.slug}
              count={c.count}
              thumbnail={c.image}
            />
          ))}
        </div>
      )}

      <div className="mx-auto max-w-xs">
        <ShopAdCard />
      </div>

      <InfoStrip />
    </div>
  );
}
