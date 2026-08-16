"use client";

import {
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import toast from "react-hot-toast";

import { cn } from "@/utils/cn";
import FulfillmentQRCode from "./FulfillmentQRCode";

type FulfillmentStatus =
  | "pending"
  | "dispatched"
  | "ready_for_pickup"
  | "delivered"
  | "picked_up"
  | "issue_reported"
  | "resolved";

type OrderItem = {
  _id?: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  fulfillmentToken?: string;
  fulfillmentStatus?: FulfillmentStatus;
  etaText?: string;
  issueReport?: { reportedBy: "buyer" | "handler" };
};

type Order = {
  _id: string;
  createdAt: string;
  total: number;
  status: string;
  paymentIntentId?: string;
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

const ITEM_STATUS_STYLES: Record<FulfillmentStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting Dispatch", className: "bg-gray-100 text-gray-600" },
  dispatched: { label: "On Its Way", className: "bg-blue-50 text-blue-600" },
  ready_for_pickup: { label: "Ready for Pickup", className: "bg-blue-50 text-blue-600" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-700" },
  picked_up: { label: "Picked Up", className: "bg-green-100 text-green-700" },
  issue_reported: { label: "Issue Reported", className: "bg-red-50 text-red-600" },
  resolved: { label: "Resolved", className: "bg-gray-100 text-gray-600" },
};

const REASON_OPTIONS = [
  { value: "item_not_received", label: "I don't have the item yet" },
  { value: "item_defective_or_wrong", label: "Item is defective or wrong" },
  { value: "no_longer_needed", label: "No longer needed" },
  { value: "other", label: "Other" },
];

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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [declineOpenFor, setDeclineOpenFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState(REASON_OPTIONS[0].value);
  const [declineNote, setDeclineNote] = useState("");
  const [decliningKey, setDecliningKey] = useState<string | null>(null);

  const filterKey = `${search}|${sortBy}|${statusFilter}|${fulfillmentFilter}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const submitDecline = async (orderId: string, itemId: string) => {
    const key = `${orderId}:${itemId}`;
    setDecliningKey(key);
    const res = await fetch(`/api/orders/${orderId}/items/${itemId}/decline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reasonCode: declineReason, note: declineNote }),
    });
    setDecliningKey(null);

    if (!res.ok) {
      toast.error("Failed to submit report");
      return;
    }

    toast.success("Issue reported — we'll review it");
    setDeclineOpenFor(null);
    setDeclineNote("");
    router.refresh();
  };

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
                    {order.paymentIntentId ? (
                      <ul className="space-y-2 text-xs text-gray-500">
                        {order.items.map((i, idx) => {
                          const itemStatus = i.fulfillmentStatus || "pending";
                          const badge = ITEM_STATUS_STYLES[itemStatus];
                          const canAct =
                            itemStatus === "dispatched" ||
                            itemStatus === "ready_for_pickup";
                          const key = `${order._id}:${i._id}`;
                          const isDeclineOpen = declineOpenFor === key;
                          const isSubmitting = decliningKey === key;

                          return (
                            <li
                              key={idx}
                              className="space-y-1.5 rounded-lg border border-black/5 p-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span>
                                  {i.title} × {i.quantity}
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                    badge.className,
                                  )}
                                >
                                  {badge.label}
                                </span>
                              </div>

                              {canAct && i.etaText && (
                                <p className="text-[11px] text-gray-400">
                                  ETA: {i.etaText}
                                </p>
                              )}

                              {itemStatus === "issue_reported" && (
                                <p className="text-[11px] text-amber-600">
                                  We&apos;re reviewing this item.
                                </p>
                              )}

                              {canAct && i.fulfillmentToken && !isDeclineOpen && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setQrToken(i.fulfillmentToken!)}
                                    className="cursor-pointer rounded-lg bg-[#2c6e9b] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#2c6e9b]/90"
                                  >
                                    Show confirmation code
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeclineOpenFor(key);
                                      setDeclineReason(REASON_OPTIONS[0].value);
                                      setDeclineNote("");
                                    }}
                                    className="cursor-pointer rounded-lg border border-black/10 px-2.5 py-1 text-[11px] text-gray-500 transition hover:bg-black/5"
                                  >
                                    Report a problem
                                  </button>
                                </div>
                              )}

                              {isDeclineOpen && (
                                <div className="space-y-1.5 pt-1">
                                  <select
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    className="w-full rounded-lg border border-black/10 px-2 py-1 text-[11px]"
                                  >
                                    {REASON_OPTIONS.map((r) => (
                                      <option key={r.value} value={r.value}>
                                        {r.label}
                                      </option>
                                    ))}
                                  </select>
                                  <textarea
                                    value={declineNote}
                                    onChange={(e) => setDeclineNote(e.target.value)}
                                    placeholder="Add details (optional)"
                                    rows={2}
                                    className="w-full rounded-lg border border-black/10 px-2 py-1 text-[11px]"
                                  />
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isSubmitting}
                                      onClick={() => submitDecline(order._id, i._id!)}
                                      className="cursor-pointer rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                                    >
                                      {isSubmitting ? "Submitting..." : "Submit"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeclineOpenFor(null)}
                                      className="cursor-pointer rounded-lg border border-black/10 px-2.5 py-1 text-[11px] text-gray-500 transition hover:bg-black/5"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <ul className="text-xs text-gray-500">
                        {order.items.map((i, idx) => (
                          <li key={idx}>
                            {i.title} × {i.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
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

      {qrToken && (
        <FulfillmentQRCode token={qrToken} onClose={() => setQrToken(null)} />
      )}
    </div>
  );
}
