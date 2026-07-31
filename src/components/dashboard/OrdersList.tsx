"use client";

import {
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  _id: string;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
  address?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
  };
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  shipped: "bg-purple-100 text-purple-700",
  pending: "bg-gray-100 text-gray-700",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount-desc", label: "Highest Amount" },
  { value: "amount-asc", label: "Lowest Amount" },
];

const STATUS_OPTIONS = ["All", "Paid", "Shipped", "Pending"];
const FULFILLMENT_OPTIONS = ["All", "Delivery", "Pickup"];

const PAGE_SIZE = 8;

export default function OrdersList({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filterKey = `${search}|${sortBy}|${statusFilter}|${fulfillmentFilter}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const filtered = useMemo(() => {
    let rows = [...orders];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q)),
      );
    }

    if (statusFilter !== "All") {
      rows = rows.filter(
        (o) => o.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (fulfillmentFilter !== "All") {
      rows = rows.filter((o) =>
        fulfillmentFilter === "Delivery" ? !!o.address : !o.address,
      );
    }

    rows.sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amount-desc") return b.total - a.total;
      if (sortBy === "amount-asc") return a.total - b.total;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return rows;
  }, [orders, search, sortBy, statusFilter, fulfillmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition cursor-pointer ${
            showFilters
              ? "border-[#2c6e9b] bg-[#2c6e9b]/10 text-[#2c6e9b]"
              : "border-black/10 bg-white text-gray-500 hover:bg-gray-50"
          }`}
          aria-label="Toggle filters"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-6 rounded-xl border border-black/5 bg-white p-4 text-sm shadow-sm">
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatusFilter(opt)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                    statusFilter === opt
                      ? "bg-[#2c6e9b] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">
              Fulfillment
            </p>
            <div className="flex flex-wrap gap-2">
              {FULFILLMENT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFulfillmentFilter(opt)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                    fulfillmentFilter === opt
                      ? "bg-[#2c6e9b] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          No orders found.
        </p>
      ) : (
        <div className="space-y-4">
          {pageItems.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#173d5c]">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-[#173d5c]">
                  €{order.total.toFixed(2)}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>
                {order.address ? (
                  <span className="rounded-full bg-[#2c6e9b]/10 px-2.5 py-1 text-[11px] font-medium text-[#2c6e9b]">
                    DELIVERY
                  </span>
                ) : (
                  <span className="rounded-full bg-[#eab657]/15 px-2.5 py-1 text-[11px] font-medium text-[#b8863a]">
                    PICKUP
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {order.items[0]?.image ? (
                    <img
                      src={order.items[0].image}
                      alt={order.items[0].title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#2c6e9b]/10">
                      <FaShoppingBag className="h-4 w-4 text-[#2c6e9b]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  {order.address ? (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium text-gray-600">
                        Shipping Address:
                      </p>
                      <p>
                        {order.address.name}, {order.address.street}
                      </p>
                      <p>
                        {order.address.city}, {order.address.postalCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-400">
                      Pickup from store location
                    </p>
                  )}

                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Items:
                    </p>
                    <ul className="text-xs text-gray-500">
                      {order.items.map((i, idx) => (
                        <li key={idx}>
                          {i.title} × {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            &laquo;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition cursor-pointer ${
                n === page
                  ? "bg-[#2c6e9b] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
}
