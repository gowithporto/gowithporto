"use client";

import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CpuChipIcon,
  CurrencyEuroIcon,
  PlusIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import banner from "@/assets/HERO BG.png";
import DonutChart from "@/components/admin/DonutChart";
import Sparkline from "@/components/admin/Sparkline";
import SalesChart from "@/components/store-owner/SalesChart";
import { cn } from "@/utils/cn";

type RevenueResponse = {
  totalRevenue: number;
  dailyRevenue: { _id: string; total: number }[];
};

type AdminOrder = {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  userEmail: string;
  storeId?: { _id?: string; name: string } | string | null;
  items: { title: string; quantity: number }[];
};

type AdminStore = {
  _id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
};

const REVENUE_STATUSES = ["paid", "shipped", "delivered", "completed"];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  shipped: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  paid: {
    label: "Processing",
    className: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
};

function statusBadge(status: string) {
  const key = status?.toLowerCase();
  return (
    STATUS_STYLES[key] || {
      label: status || "Unknown",
      className: "bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50",
    }
  );
}

function isRevenueStatus(status: string) {
  return REVENUE_STATUSES.includes(status?.toLowerCase());
}

function formatEuro(v: number) {
  return `€${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const RANGE_OPTIONS = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 60 Days", days: 60 },
];

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(30);
  const [apiStatus, setApiStatus] = useState({
    revenue: true,
    orders: true,
    stores: true,
    users: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchJson(url: string) {
      const res = await fetch(url, { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error(`Request failed: ${url}`);
      return res.json();
    }

    async function load() {
      const results = await Promise.allSettled([
        fetchJson("/api/admin/revenue"),
        fetchJson("/api/admin/orders?limit=1000"),
        fetchJson("/api/admin/stores"),
        fetchJson("/api/admin/users"),
      ]);
      if (cancelled) return;

      const [rev, ord, st, us] = results;
      setRevenue(rev.status === "fulfilled" ? rev.value : null);
      setOrders(
        ord.status === "fulfilled" && Array.isArray(ord.value) ? ord.value : [],
      );
      setStores(
        st.status === "fulfilled" && Array.isArray(st.value) ? st.value : [],
      );
      setUsers(
        us.status === "fulfilled" && Array.isArray(us.value) ? us.value : [],
      );
      setApiStatus({
        revenue: rev.status === "fulfilled",
        orders: ord.status === "fulfilled",
        stores: st.status === "fulfilled",
        users: us.status === "fulfilled",
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const dailyMap = useMemo(() => {
    const map = new Map<string, number>();
    revenue?.dailyRevenue.forEach((d) => map.set(d._id, d.total));
    return map;
  }, [revenue]);

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const last30 = new Date(now);
    last30.setDate(now.getDate() - 30);
    const prev30Start = new Date(last30);
    prev30Start.setDate(last30.getDate() - 30);

    const sumRange = (start: Date, end: Date) => {
      let sum = 0;
      dailyMap.forEach((total, dateStr) => {
        const d = new Date(dateStr);
        if (d >= start && d < end) sum += total;
      });
      return sum;
    };

    const revenueLast30 = sumRange(last30, now);
    const revenuePrev30 = sumRange(prev30Start, last30);
    const revenueDelta =
      revenuePrev30 > 0
        ? ((revenueLast30 - revenuePrev30) / revenuePrev30) * 100
        : null;

    const ordersToday = orders.filter(
      (o) => new Date(o.createdAt) >= today,
    ).length;

    const activeStores = stores.filter((s) => s.active).length;
    const newStores30 = stores.filter(
      (s) => new Date(s.createdAt) >= last30,
    ).length;

    const customers = users.filter((u) => u.role === "USER");
    const newUsers30 = customers.filter(
      (u) => new Date(u.createdAt) >= last30,
    ).length;

    const last14 = (getValue: (day: Date, next: Date) => number) => {
      const values: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const next = new Date(day);
        next.setDate(day.getDate() + 1);
        values.push(getValue(day, next));
      }
      return values;
    };

    const revenueSpark = last14(
      (day) => dailyMap.get(day.toISOString().slice(0, 10)) || 0,
    );
    const ordersSpark = last14(
      (day, next) =>
        orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= day && d < next;
        }).length,
    );
    const storesSpark = last14(
      (day, next) =>
        stores.filter((s) => {
          const d = new Date(s.createdAt);
          return d >= day && d < next;
        }).length,
    );
    const usersSpark = last14(
      (day, next) =>
        customers.filter((u) => {
          const d = new Date(u.createdAt);
          return d >= day && d < next;
        }).length,
    );

    return {
      totalRevenue: revenue?.totalRevenue || 0,
      revenueDelta,
      ordersToday,
      activeStores,
      newStores30,
      totalOrders: orders.length,
      totalUsers: customers.length,
      newUsers30,
      revenueSpark,
      ordersSpark,
      storesSpark,
      usersSpark,
    };
  }, [revenue, orders, stores, users, dailyMap]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days: { date: Date; value: number }[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ date: d, value: dailyMap.get(d.toISOString().slice(0, 10)) || 0 });
    }
    return days;
  }, [dailyMap, rangeDays]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [orders],
  );

  const platformSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const key = o.status?.toLowerCase() || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });

    const known = ["shipped", "paid", "pending", "cancelled"];
    const slices = [
      { label: "Completed", value: counts.shipped || 0, color: "#10b981" },
      { label: "Processing", value: counts.paid || 0, color: "#3b82f6" },
      { label: "Pending", value: counts.pending || 0, color: "#f59e0b" },
      { label: "Cancelled", value: counts.cancelled || 0, color: "#ef4444" },
    ];
    const other = Object.entries(counts)
      .filter(([k]) => !known.includes(k))
      .reduce((s, [, v]) => s + v, 0);
    if (other > 0) slices.push({ label: "Other", value: other, color: "#9ca3af" });

    return slices;
  }, [orders]);

  const topStores = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    orders
      .filter((o) => isRevenueStatus(o.status))
      .forEach((o) => {
        const store = typeof o.storeId === "object" && o.storeId ? o.storeId : null;
        const id = store?._id || (typeof o.storeId === "string" ? o.storeId : "unknown");
        const name = store?.name || "Unknown Store";
        const entry = map.get(id) || { name, total: 0, count: 0 };
        entry.total += o.total;
        entry.count += 1;
        map.set(id, entry);
      });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  const maxStoreRevenue = Math.max(...topStores.map((s) => s.total), 1);

  const systemChecks = [
    { name: "Revenue API", ok: apiStatus.revenue },
    { name: "Orders API", ok: apiStatus.orders },
    { name: "Stores API", ok: apiStatus.stores },
    { name: "Users API", ok: apiStatus.users },
  ];
  const allOperational = systemChecks.every((c) => c.ok);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatEuro(stats.totalRevenue),
      icon: CurrencyEuroIcon,
      color: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400",
      spark: stats.revenueSpark,
      sparkColor: "#10b981",
      subtitle:
        stats.revenueDelta === null ? (
          <span className="text-black/40 dark:text-white/40">
            Not enough data yet
          </span>
        ) : (
          <span
            className={cn(
              "font-medium",
              stats.revenueDelta >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500",
            )}
          >
            {stats.revenueDelta >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(stats.revenueDelta).toFixed(1)}% from last month
          </span>
        ),
    },
    {
      label: "Active Stores",
      value: stats.activeStores.toLocaleString(),
      icon: BuildingStorefrontIcon,
      color: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
      spark: stats.storesSpark,
      sparkColor: "#3b82f6",
      subtitle: (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          ↑ {stats.newStores30} new stores
        </span>
      ),
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      color: "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400",
      spark: stats.ordersSpark,
      sparkColor: "#8b5cf6",
      subtitle: (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          ↑ {stats.ordersToday} today
        </span>
      ),
    },
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400",
      spark: stats.usersSpark,
      sparkColor: "#f59e0b",
      subtitle: (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          ↑ {stats.newUsers30} new users
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src={banner}
          alt=""
          className="h-40 w-full object-cover object-right sm:h-44"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-white via-white/70 to-transparent dark:from-[#0b1219] dark:via-[#0b1219]/60" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] dark:text-white sm:text-3xl">
            Welcome back, {session?.user?.name || "Admin"}! 👋
          </h1>
          <p className="mt-1 text-sm text-[#3d4f5c] dark:text-white/70">
            Here&apos;s what&apos;s happening on your platform today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111c27]"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  c.color,
                )}
              >
                <c.icon className="h-5 w-5" />
              </span>
              <span className="text-sm text-black/50 dark:text-white/50">
                {c.label}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1d3d5c] dark:text-white">
              {c.value}
            </p>
            <p className="mt-1 text-xs">{c.subtitle}</p>
            <div className="mt-2">
              <Sparkline data={c.spark} color={c.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue overview + recent orders */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-medium text-[#1d3d5c] dark:text-white">
                  Revenue Overview
                </h2>
                <p className="mt-0.5 text-xl font-bold text-[#1d3d5c] dark:text-white">
                  {formatEuro(stats.totalRevenue)}
                </p>
              </div>
              <select
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
                className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#3d4f5c] dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                {RANGE_OPTIONS.map((o) => (
                  <option key={o.days} value={o.days}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              {loading ? (
                <div className="flex h-65 items-center justify-center text-sm text-black/40 dark:text-white/40">
                  Loading chart...
                </div>
              ) : (
                <SalesChart data={chartData} />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-[#2c6e9b] hover:underline"
              >
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="mt-6 text-center text-sm text-black/40 dark:text-white/40">
                {loading ? "Loading orders..." : "No orders yet."}
              </p>
            ) : (
              <div className="mt-3 divide-y divide-black/5 dark:divide-white/5">
                {recentOrders.map((o) => {
                  const badge = statusBadge(o.status);
                  const store =
                    typeof o.storeId === "object" && o.storeId
                      ? o.storeId.name
                      : null;
                  return (
                    <div
                      key={o._id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[#1d3d5c] dark:text-white">
                          #{o._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="truncate text-xs text-black/40 dark:text-white/40">
                          {store || o.userEmail}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                      <div className="shrink-0 text-right">
                        <p className="font-medium text-[#1d3d5c] dark:text-white">
                          {formatEuro(o.total)}
                        </p>
                        <p className="text-xs text-black/40 dark:text-white/40">
                          {timeAgo(o.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Platform summary + system status */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
            <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
              Platform Summary
            </h2>
            <div className="mt-4">
              <DonutChart
                slices={platformSummary}
                centerValue={orders.length.toLocaleString()}
                centerLabel="Total Orders"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
                System Status
              </h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  allOperational
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                )}
              >
                {allOperational ? "All Systems Operational" : "Degraded"}
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              {systemChecks.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
                    {c.ok ? (
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                    {c.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      c.ok
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500",
                    )}
                  >
                    {c.ok ? "Operational" : "Unavailable"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top performing stores */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#111c27]">
          <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
            Top Performing Stores
          </h2>
          {topStores.length === 0 ? (
            <p className="mt-6 text-center text-sm text-black/40 dark:text-white/40">
              {loading ? "Loading stores..." : "No store revenue yet."}
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-xs tracking-wide text-black/40 uppercase dark:border-white/10 dark:text-white/40">
                    <th className="py-2 pr-4 font-medium">Store</th>
                    <th className="py-2 pr-4 font-medium">Total Orders</th>
                    <th className="py-2 pr-4 font-medium">Revenue</th>
                    <th className="py-2 pr-4 font-medium">Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topStores.map((s, idx) => (
                    <tr
                      key={s.name + idx}
                      className="border-b border-black/5 last:border-0 dark:border-white/5"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eab657]/15 text-xs font-bold text-[#b8863a]">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-[#1d3d5c] dark:text-white">
                            {s.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-black/60 dark:text-white/60">
                        {s.count}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="space-y-1">
                          <span className="font-medium text-[#1d3d5c] dark:text-white">
                            {formatEuro(s.total)}
                          </span>
                          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#2c6e9b]"
                              style={{
                                width: `${(s.total / maxStoreRevenue) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-black/60 dark:text-white/60">
                        {formatEuro(s.total / s.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111c27]">
          <h2 className="font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
            Quick Actions
          </h2>
          <div className="mt-3 space-y-1">
            <QuickAction
              href="/admin/stores"
              icon={PlusIcon}
              title="Add New Store"
              subtitle="Onboard a new partner store"
            />
            <QuickAction
              href="/admin/orders"
              icon={ShoppingBagIcon}
              title="View All Orders"
              subtitle="Monitor platform-wide orders"
            />
            <QuickAction
              href="/admin/ai-settings"
              icon={CpuChipIcon}
              title="AI Settings"
              subtitle="Configure the AI trip planner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-black/3 dark:hover:bg-white/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2c6e9b]/10 text-[#2c6e9b]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#1d3d5c] dark:text-white">
          {title}
        </p>
        <p className="truncate text-xs text-black/40 dark:text-white/40">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
