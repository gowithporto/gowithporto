"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { addToCart } from "@/store/slices/cartSlice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const dispatch = useDispatch();
  const { data: session } = useSession();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();

        // THIS is the important fix
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (sort) params.append("sort", sort);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then(setProducts);
  }, [category, sort]);

  return (
    <div className="pt-20 px-4 sm:p-28 space-y-6">
      <h1 className="text-3xl font-bold">Shop Porto Souvenirs</h1>

      <div className="flex gap-4">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {Array.isArray(categories) &&
            categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
        </Select>

        <select onChange={(e) => setSort(e.target.value)}>
          <option value="">Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name-asc">Name: A → Z</option>
          <option value="name-desc">Name: Z → A</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Card key={p._id} className="space-y-2">
            {/* ONE Link only */}
            <Link href={`/shop/${p.slug}`} className="block space-y-2">
              <img
                src={p.images?.[0]}
                alt={p.title}
                className="h-48 w-full object-cover rounded"
              />
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.storeId?.name}</p>
              <p className="font-bold">€{p.price}</p>
              <p className="text-sm text-gray-600">
                Available: {p.quantity || 0}
              </p>
            </Link>

            {/* Button is NOT inside Link */}
            {session?.user.role !== "STORE_OWNER" && (
              <Button
                className="mt-2 w-full"
                onClick={() =>
                  dispatch(
                    addToCart({
                      productId: p._id,
                      title: p.title,
                      price: p.price,
                      image: p.images?.[0],
                      quantity: 1,
                    }),
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
