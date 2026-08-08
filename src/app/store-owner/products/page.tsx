"use client";

import {
  CubeIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  Square3Stack3DIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/utils/cn";

type Product = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
  category?: string;
  quantity?: number;
  active: boolean;
};

const LOW_STOCK_THRESHOLD = 10;

function formatEuro(v: number) {
  return `€${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function StoreOwnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/store-owner/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category).filter(Boolean) as string[],
    );
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.title
        ?.toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active).length;
    const lowStock = products.filter(
      (p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= LOW_STOCK_THRESHOLD,
    ).length;
    const outOfStock = products.filter((p) => (p.quantity ?? 0) === 0).length;
    const inventoryValue = products.reduce(
      (s, p) => s + p.price * (p.quantity ?? 0),
      0,
    );
    return {
      total: products.length,
      active,
      attention: lowStock + outOfStock,
      inventoryValue,
    };
  }, [products]);

  const deleteProduct = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const res = await fetch(`/api/store-owner/products/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      toast.error(error.error || "Failed to delete product");
      return;
    }

    toast.success("Product deleted");
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] dark:text-white">
            Products
          </h1>
          <p className="mt-1 text-sm text-black/50 dark:text-white/50">
            Manage your store&apos;s catalogue and stock.
          </p>
        </div>
        <Link
          href="/store-owner/products/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#2c6e9b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2c6e9b]/90"
        >
          <PlusIcon className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Square3Stack3DIcon}
          label="Total Products"
          value={stats.total}
          color="bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <StatCard
          icon={CubeIcon}
          label="Active"
          value={stats.active}
          color="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Needs Attention"
          value={stats.attention}
          color="bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          icon={CurrencyEuroIcon}
          label="Inventory Value"
          value={formatEuro(stats.inventoryValue)}
          color="bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400"
        />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-white/10 dark:bg-[#111c27]">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/30 dark:text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20 dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#3d4f5c] capitalize dark:border-white/15 dark:bg-white/5 dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-[#111c27]">
        {loading ? (
          <div className="p-10 text-center text-sm text-black/40 dark:text-white/40">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasProducts={products.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs tracking-wide text-black/40 uppercase dark:border-white/10 dark:text-white/40">
                  <th className="py-3 pr-4 pl-5 font-medium">Product</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const qty = p.quantity ?? 0;
                  const stockState =
                    qty === 0 ? "out" : qty <= LOW_STOCK_THRESHOLD ? "low" : "ok";

                  return (
                    <tr
                      key={p._id}
                      className="border-b border-black/5 last:border-0 dark:border-white/5"
                    >
                      <td className="py-3 pr-4 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-black/20 dark:text-white/20">
                                <CubeIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#1d3d5c] dark:text-white">
                              {p.title}
                            </p>
                            <p className="text-xs text-black/40 dark:text-white/40">
                              {formatEuro(p.price)} / unit
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {p.category ? (
                          <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60 capitalize dark:bg-white/10 dark:text-white/60">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-black/30 dark:text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium text-[#1d3d5c] dark:text-white">
                        {formatEuro(p.price)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "font-medium",
                            stockState === "out"
                              ? "text-red-500"
                              : stockState === "low"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-black/60 dark:text-white/60",
                          )}
                        >
                          {qty}
                        </span>
                        {stockState !== "ok" && (
                          <span
                            className={cn(
                              "ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium",
                              stockState === "out"
                                ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                            )}
                          >
                            {stockState === "out" ? "Out of stock" : "Low stock"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            p.active
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-black/5 text-black/40 dark:bg-white/10 dark:text-white/40",
                          )}
                        >
                          {p.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/store-owner/products/${p._id}/edit`}
                            aria-label={`Edit ${p.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#2c6e9b] transition hover:bg-[#2c6e9b]/10"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => deleteProduct(p._id, p.title)}
                            disabled={deletingId === p._id}
                            aria-label={`Delete ${p.title}`}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-[#111c27]">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            color,
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="text-xs text-black/50 sm:text-sm dark:text-white/50">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-[#1d3d5c] sm:text-2xl dark:text-white">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ hasProducts }: { hasProducts: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
        <CubeIcon className="h-7 w-7" />
      </div>
      <p className="mt-4 font-medium text-[#1d3d5c] dark:text-white">
        {hasProducts ? "No products match your search" : "No products yet"}
      </p>
      <p className="mt-1 text-sm text-black/40 dark:text-white/40">
        {hasProducts
          ? "Try a different search term or category."
          : "Add your first product to start selling."}
      </p>
      {!hasProducts && (
        <Link
          href="/store-owner/products/new"
          className="mt-4 flex items-center gap-2 rounded-xl bg-[#2c6e9b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2c6e9b]/90"
        >
          <PlusIcon className="h-4 w-4" /> Add Product
        </Link>
      )}
    </div>
  );
}
