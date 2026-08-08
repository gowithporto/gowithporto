import { authOptions } from "@/lib/auth";
import {
  CreditCardIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaHeart, FaShoppingBag } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";

import moment1 from "@/assets/1. home page/discover_porto/1.png";
import moment2 from "@/assets/1. home page/discover_porto/2.png";
import moment3 from "@/assets/1. home page/discover_porto/3.png";
import moment4 from "@/assets/1. home page/discover_porto/4.png";
import banner from "@/assets/6. user dashboard page/banner.png";

const MOMENT_IMAGES = [moment1, moment2, moment3, moment4];

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  pending: "bg-gray-100 text-gray-700",
};

function deriveMoment(prompt: any) {
  const budget = prompt?.budget;
  const people = prompt?.people;

  if (budget === "Luxury")
    return {
      tag: "Luxury",
      title: "Porto in Style",
      tagClass: "bg-[#eab657] text-white",
    };
  if (people === "Family")
    return {
      tag: "Family",
      title: "Family Adventure",
      tagClass: "bg-[#2c6e9b] text-white",
    };
  if (people === "Couple")
    return {
      tag: "Couple",
      title: "Romantic Escape",
      tagClass: "bg-rose-500 text-white",
    };
  if (people === "Solo")
    return {
      tag: "Solo",
      title: "Solo Explorer",
      tagClass: "bg-emerald-500 text-white",
    };
  return {
    tag: people || "Trip",
    title: "Porto Adventure",
    tagClass: "bg-gray-600 text-white",
  };
}

async function getData() {
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };
  const baseUrl = process.env.NEXTAUTH_URL;

  const [orders, credits, aiHistory] = await Promise.all([
    fetch(`${baseUrl}/api/orders`, { headers, cache: "no-store" }).then((r) =>
      r.ok ? r.json() : [],
    ),
    fetch(`${baseUrl}/api/user/credits`, { headers, cache: "no-store" }).then(
      (r) => (r.ok ? r.json() : { credits: 0, memberSince: null }),
    ),
    fetch(`${baseUrl}/api/user/ai-history`, {
      headers,
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : [])),
  ]);

  return { orders, credits, aiHistory };
}

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { orders, credits, aiHistory } = await getData();

  const recentOrders = orders.slice(0, 3);
  const recentAi = aiHistory.slice(0, 3);
  const travelMoments = aiHistory.slice(0, 4);

  const firstName = session.user?.name?.split(" ")[0] || "Traveler";
  const tierValidUntil = `Dec 31, ${new Date().getFullYear()}`;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#173d5c] sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Here&apos;s your Porto journey at a glance.
          </p>
        </div>
        <Image
          src={banner}
          alt="Porto riverside"
          className="h-auto w-full max-w-xl object-contain"
          priority
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-[#2c6e9b] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-90">Available Credits</p>
            <CreditCardIcon className="h-5 w-5 opacity-80" />
          </div>
          <p className="mt-2 text-4xl font-bold">{credits.credits}</p>
          <Link
            href="/dashboard/transactions"
            className="mt-4 inline-block text-sm underline opacity-80 hover:opacity-100"
          >
            View Transactions &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-4xl font-bold text-[#173d5c]">
            {orders.length}
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-4 inline-block text-sm text-[#2c6e9b] hover:underline"
          >
            View All Orders &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              AI Plans Generated
            </p>
            <SparklesIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-4xl font-bold text-[#173d5c]">
            {aiHistory.length}
          </p>
          <Link
            href="/dashboard/ai-history"
            className="mt-4 inline-block text-sm text-[#2c6e9b] hover:underline"
          >
            View AI History &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-black/5 bg-[#fdf6e8] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Member Tier</p>
            <TrophyIcon className="h-5 w-5 text-[#eab657]" />
          </div>
          <p className="mt-2 text-3xl font-bold text-[#b8863a]">Premium</p>
          <p className="mt-4 text-sm text-gray-500">
            Valid until {tierValidUntil}
          </p>
        </div>
      </div>

      {/* Recent Orders / Recent AI Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-[#173d5c]">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-[#2c6e9b] hover:underline"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              No recent orders.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center gap-3 py-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#2c6e9b]/10">
                    <FaShoppingBag className="h-4 w-4 text-[#2c6e9b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} &middot;{" "}
                      {order.items?.length ?? 0} item(s)
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-[var(--text)]">
                      €{order.total.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[order.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-[#173d5c]">
              Recent AI Activity
            </h2>
            <Link
              href="/dashboard/ai-history"
              className="text-sm text-[#2c6e9b] hover:underline"
            >
              View All History &rarr;
            </Link>
          </div>

          {recentAi.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              No AI activity found.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {recentAi.map((item: any) => (
                <div key={item._id} className="flex items-center gap-3 py-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <FaWandMagicSparkles className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text)]">
                      AI Plan Generated
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.prompt?.days} Days &middot; {item.prompt?.budget}{" "}
                      &middot; {item.prompt?.people}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* AI Travel Moments */}
      {travelMoments.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-medium text-[#173d5c]">
              Your AI Travel Moments
            </h2>
            <Link
              href="/dashboard/ai-history"
              className="text-sm text-[#2c6e9b] hover:underline"
            >
              View All Trips &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {travelMoments.map((item: any, idx: number) => {
              const { tag, title, tagClass } = deriveMoment(item.prompt);
              return (
                <Link
                  key={item._id}
                  href={`/ai/result?id=${item._id}`}
                  className="group relative block h-44 overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
                >
                  <Image
                    src={MOMENT_IMAGES[idx % MOMENT_IMAGES.length]}
                    alt={title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium ${tagClass}`}
                  >
                    {tag}
                  </span>
                  <FaHeart className="absolute right-3 top-3 h-4 w-4 text-white/80 transition hover:text-white" />

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-semibold leading-tight">{title}</p>
                    <p className="text-xs opacity-80">
                      {item.prompt?.days} Days
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
