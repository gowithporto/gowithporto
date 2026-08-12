"use client";

import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CurrencyEuroIcon,
  MinusIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import banner from "@/assets/6. user dashboard page/banner.png";
import payoutBg from "@/assets/8. ai credit transactions page/current balance bg.png";
import SalesChart from "@/components/store-owner/SalesChart";
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
  address?: { name?: string };
  items: OrderItem[];
};

const RANGE_OPTIONS = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  shipped: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-600",
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
      className: "bg-amber-50 text-amber-600",
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

type ConnectStatus = {
  connected: boolean;
  onboardingComplete: boolean;
  commissionRate: number;
};

export default function StoreOwnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(30);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(
    null,
  );
  const [connecting, setConnecting] = useState(false);
  const [viewingPayouts, setViewingPayouts] = useState(false);

  useEffect(() => {
    fetch("/api/store-owner/orders", {
      cache: "no-store",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));

    fetch("/api/store-owner/connect", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setConnectStatus);
  }, []);

  const handlePayoutSetup = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/store-owner/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Couldn't start payout setup. Try again.");
      }
    } catch {
      toast.error("Couldn't start payout setup. Try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleViewPayouts = async () => {
    setViewingPayouts(true);
    try {
      const res = await fetch("/api/store-owner/payouts", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Couldn't open your Stripe payouts. Try again.");
      }
    } catch {
      toast.error("Couldn't open your Stripe payouts. Try again.");
    } finally {
      setViewingPayouts(false);
    }
  };

  const handlePayoutAction = connectStatus?.onboardingComplete
    ? handleViewPayouts
    : handlePayoutSetup;

  const stats = useMemo(() => {
    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(now.getDate() - rangeDays);
    const prevStart = new Date(rangeStart);
    prevStart.setDate(rangeStart.getDate() - rangeDays);

    const inRange = orders.filter((o) => new Date(o.createdAt) >= rangeStart);
    const inPrevRange = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= prevStart && d < rangeStart;
    });

    const revenue = inRange.reduce((s, o) => s + orderRevenue(o), 0);
    const prevRevenue = inPrevRange.reduce((s, o) => s + orderRevenue(o), 0);

    const totalOrders = inRange.length;
    const prevTotalOrders = inPrevRange.length;

    const avgOrder = totalOrders ? revenue / totalOrders : 0;
    const prevAvgOrder = prevTotalOrders ? prevRevenue / prevTotalOrders : 0;

    const pendingOrders = orders.filter((o) => o.status !== "shipped");
    const pendingPayouts = pendingOrders.reduce(
      (s, o) => s + orderRevenue(o),
      0,
    );

    const delta = (curr: number, prev: number) =>
      prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? null : 0;

    return {
      totalOrders,
      revenue,
      avgOrder,
      pendingPayouts,
      pendingCount: pendingOrders.length,
      ordersDelta: delta(totalOrders, prevTotalOrders),
      revenueDelta: delta(revenue, prevRevenue),
      avgDelta: delta(avgOrder, prevAvgOrder),
    };
  }, [orders, rangeDays]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days: { date: Date; value: number }[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ date: d, value: 0 });
    }
    const indexByDay = new Map(days.map((d, idx) => [d.date.toDateString(), idx]));
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      d.setHours(0, 0, 0, 0);
      const idx = indexByDay.get(d.toDateString());
      if (idx !== undefined) days[idx].value += orderRevenue(o);
    });
    return days;
  }, [orders, rangeDays]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [orders],
  );

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      delta: stats.ordersDelta,
      icon: ShoppingBagIcon,
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "Total Revenue",
      value: formatEuro(stats.revenue),
      delta: stats.revenueDelta,
      icon: CurrencyEuroIcon,
      color:
        "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Avg. Order Value",
      value: formatEuro(stats.avgOrder),
      delta: stats.avgDelta,
      icon: WalletIcon,
      color:
        "bg-violet-50 text-violet-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src={banner}
          alt=""
          className="h-40 w-full object-cover sm:h-48"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-white via-white/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="font-serif text-2xl font-semibold text-[#1d3d5c] sm:text-3xl">
            Store Owner Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#3d4f5c]">
            Manage your store, orders, and payouts.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
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
              <span className="text-sm text-black/50">
                {c.label}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1d3d5c]">
              {c.value}
            </p>
            <DeltaLabel delta={c.delta} rangeDays={rangeDays} />
          </div>
        ))}

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <ArchiveBoxIcon className="h-5 w-5" />
            </span>
            <span className="text-sm text-black/50">
              Pending Payouts
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#1d3d5c]">
            {formatEuro(stats.pendingPayouts)}
          </p>
          <p className="mt-1 text-xs text-black/40">
            {stats.pendingCount === 0
              ? "No orders awaiting payout"
              : `${stats.pendingCount} order${stats.pendingCount === 1 ? "" : "s"} awaiting payout`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales overview + recent orders */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
                Sales Overview
              </h2>
              <select
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
                className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#3d4f5c]"
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
                <div className="flex h-65 items-center justify-center text-sm text-black/40">
                  Loading chart...
                </div>
              ) : (
                <SalesChart data={chartData} />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
                Recent Orders
              </h2>
              <Link
                href="/store-owner/orders"
                className="flex items-center gap-1 text-sm font-medium text-[#2c6e9b] hover:underline"
              >
                View All Orders <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="mt-6 text-center text-sm text-black/40">
                {loading ? "Loading orders..." : "No orders yet for your store."}
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-left text-xs tracking-wide text-black/40 uppercase">
                      <th className="py-2 pr-4 font-medium">Order ID</th>
                      <th className="py-2 pr-4 font-medium">Customer</th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const badge = statusBadge(o.status);
                      return (
                        <tr
                          key={o._id}
                          className="border-b border-black/5 last:border-0"
                        >
                          <td className="py-3 pr-4 font-medium text-[#1d3d5c]">
                            #{o._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 pr-4 text-black/60">
                            {o.address?.name || o.userEmail}
                          </td>
                          <td className="py-3 pr-4 text-black/50">
                            {new Date(o.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-medium",
                                badge.className,
                              )}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-medium text-[#1d3d5c]">
                            {formatEuro(orderRevenue(o))}
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

        {/* Quick actions + payout balance */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-medium text-[#1d3d5c]">
              Quick Actions
            </h2>
            <div className="mt-3 space-y-1">
              <QuickAction
                href="/store-owner/products/new"
                icon={PlusCircleIcon}
                title="Add New Product"
                subtitle="List a new product in your store"
              />
              <QuickAction
                href="/store-owner/orders"
                icon={ClipboardDocumentListIcon}
                title="View Orders"
                subtitle="Manage and track orders"
              />
              <QuickAction
                onClick={handlePayoutAction}
                icon={CreditCardIcon}
                title={
                  connectStatus?.onboardingComplete
                    ? "View My Payouts"
                    : "Set Up Payouts"
                }
                subtitle={
                  connectStatus?.onboardingComplete
                    ? "See payout status & history on Stripe"
                    : "Connect your bank to get paid"
                }
              />
              <QuickAction
                onClick={() => toast("Coming soon!")}
                icon={Cog6ToothIcon}
                title="Store Settings"
                subtitle="Manage your store information"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-sm">
            <Image src={payoutBg} alt="" fill className="object-cover" />
            <div className="relative p-6 text-white">
              <h2 className="font-serif text-lg font-medium">Payout Balance</h2>
              <p className="mt-1 text-sm text-white/70">Available to withdraw</p>
              <p className="mt-2 text-3xl font-bold">
                {formatEuro(stats.pendingPayouts)}
              </p>
              <button
                onClick={handlePayoutAction}
                disabled={connecting || viewingPayouts}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/15 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {connecting || viewingPayouts
                  ? "Redirecting to Stripe..."
                  : connectStatus?.onboardingComplete
                    ? "View My Payouts"
                    : "Set Up Payouts"}
              </button>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/60">
                <ShieldCheckIcon className="h-4 w-4" />
                Secured by GoWithPorto
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeltaLabel({
  delta,
  rangeDays,
}: {
  delta: number | null;
  rangeDays: number;
}) {
  if (delta === null) {
    return (
      <p className="mt-1 text-xs text-black/40">
        New this period
      </p>
    );
  }
  if (delta === 0) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-black/40">
        <MinusIcon className="h-3 w-3" /> No change
      </p>
    );
  }
  const up = delta > 0;
  const Icon = up ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1 text-xs font-medium",
        up ? "text-emerald-600" : "text-red-500",
      )}
    >
      <Icon className="h-3 w-3" /> {Math.abs(delta).toFixed(1)}% vs last{" "}
      {rangeDays} days
    </p>
  );
}

function QuickAction({
  href,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-black/3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2c6e9b]/10 text-[#2c6e9b]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#1d3d5c]">
          {title}
        </p>
        <p className="truncate text-xs text-black/40">
          {subtitle}
        </p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-black/20" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className="w-full cursor-pointer text-left">
      {content}
    </button>
  );
}
