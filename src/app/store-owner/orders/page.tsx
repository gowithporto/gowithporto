"use client";

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TruckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/utils/cn";

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  userEmail: string;
  status: string;
  createdAt: string;
  address?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
};

const STATUS_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: "paid", label: "Processing" },
  { value: "shipped", label: "Completed" },
];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  shipped: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-600",
  },
  paid: {
    label: "Processing",
    className: "bg-blue-50 text-blue-600",
  },
};

function statusBadge(status: string) {
  return (
    STATUS_STYLES[status] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className:
        "bg-amber-50 text-amber-600",
    }
  );
}

function orderRevenue(order: Order) {
  return order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function formatEuro(v: number) {
  return `€${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function StoreOwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [shippingId, setShippingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const res = await fetch("/api/store-owner/orders", {
      cache: "no-store",
      credentials: "include",
    });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, []);

  const markAsShipped = async (orderId: string) => {
    setShippingId(orderId);
    const res = await fetch(`/api/store-owner/orders/${orderId}/ship`, {
      method: "PUT",
      credentials: "include",
    });
    setShippingId(null);

    if (!res.ok) {
      toast.error("Failed to update order");
      return;
    }

    toast.success("Order marked as shipped");
    await fetchOrders();
  };

  const stats = useMemo(() => {
    const processing = orders.filter((o) => o.status === "paid").length;
    const completed = orders.filter((o) => o.status === "shipped").length;
    const revenue = orders.reduce((s, o) => s + orderRevenue(o), 0);
    return { total: orders.length, processing, completed, revenue };
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = status === "all" || o.status === status;
      const matchesSearch =
        !term ||
        o.userEmail?.toLowerCase().includes(term) ||
        o._id.toLowerCase().includes(term) ||
        o.address?.name?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [filtered],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c]">
          Orders
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Track and fulfil orders placed with your store.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Total Orders"
          value={stats.total}
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          icon={ClockIcon}
          label="Processing"
          value={stats.processing}
          color="bg-amber-50 text-amber-500"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Completed"
          value={stats.completed}
          color="bg-emerald-50 text-emerald-500"
        />
        <StatCard
          icon={CurrencyEuroIcon}
          label="Total Revenue"
          value={formatEuro(stats.revenue)}
          color="bg-violet-50 text-violet-500"
        />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or order ID..."
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#3d4f5c]"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="rounded-2xl border border-black/5 bg-white p-10 text-center text-sm text-black/40 shadow-sm">
          Loading orders...
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-black/5 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2c6e9b]/10 text-[#2c6e9b]">
            <ClipboardDocumentListIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-[#1d3d5c]">
            {orders.length === 0
              ? "No orders yet for your store"
              : "No orders match your search"}
          </p>
          <p className="mt-1 text-sm text-black/40">
            {orders.length === 0
              ? "New orders will appear here as customers check out."
              : "Try a different search term or status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => {
            const badge = statusBadge(order.status);
            const total = orderRevenue(order);
            const isShipping = shippingId === order._id;

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
              >
                {/* Card header */}
                <div className="flex flex-col gap-3 border-b border-black/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-base font-semibold text-[#1d3d5c]">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-black/50">
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4" />
                        {order.userEmail}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDaysIcon className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {order.status === "paid" && (
                    <button
                      type="button"
                      onClick={() => markAsShipped(order._id)}
                      disabled={isShipping}
                      className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2c6e9b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2c6e9b]/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <TruckIcon className="h-4 w-4" />
                      {isShipping ? "Updating..." : "Mark as Shipped"}
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="overflow-x-auto px-5 pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 text-left text-xs tracking-wide text-black/40 uppercase">
                        <th className="pb-2 font-medium">Product</th>
                        <th className="pb-2 font-medium">Qty</th>
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 text-right font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-black/5 last:border-0"
                        >
                          <td className="py-2.5 text-[#1d3d5c]">
                            {item.title}
                          </td>
                          <td className="py-2.5 text-black/60">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 text-black/60">
                            {formatEuro(item.price)}
                          </td>
                          <td className="py-2.5 text-right font-medium text-[#1d3d5c]">
                            {formatEuro(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-end py-3 text-sm">
                    <span className="text-black/50">
                      Order total:&nbsp;
                    </span>
                    <span className="font-semibold text-[#1d3d5c]">
                      {formatEuro(total)}
                    </span>
                  </div>
                </div>

                {/* Delivery address */}
                <div className="border-t border-black/5 bg-black/[0.015] px-5 py-4">
                  {order.address ? (
                    <div className="flex items-start gap-2 text-sm text-black/60">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2c6e9b]" />
                      <span>
                        <span className="font-medium text-[#1d3d5c]">
                          {order.address.name}
                        </span>
                        , {order.address.street}, {order.address.city},{" "}
                        {order.address.postalCode}, {order.address.country}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                      <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                      No delivery address provided
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            color,
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="text-xs text-black/50 sm:text-sm">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-[#1d3d5c] sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
