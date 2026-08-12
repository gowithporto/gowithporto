"use client";

import {
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  CubeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import Postcard from "@/assets/1. home page/why choose & stay inspired/stay inspired.png";
import { cn } from "@/utils/cn";

const links = [
  { href: "/store-owner", label: "Dashboard", icon: Squares2X2Icon, exact: true },
  { href: "/store-owner/products", label: "Products", icon: CubeIcon },
  { href: "/store-owner/orders", label: "Orders", icon: ShoppingBagIcon },
];

const comingSoon = [{ label: "Settings", icon: Cog6ToothIcon }];

export default function StoreOwnerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openingPayouts, setOpeningPayouts] = useState(false);

  const handlePayouts = async () => {
    setOpeningPayouts(true);
    try {
      const res = await fetch("/api/store-owner/payouts", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Set up payouts first.");
      }
    } catch {
      toast.error("Couldn't open your Stripe payouts. Try again.");
    } finally {
      setOpeningPayouts(false);
    }
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white px-4 py-8 lg:flex">
      <div className="flex flex-col items-center px-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2c6e9b]/10">
          <BuildingStorefrontIcon className="h-8 w-8 text-[#2c6e9b]" />
        </div>
        <p className="mt-3 font-serif text-lg font-semibold text-[#1d3d5c]">
          {session?.user?.storeName || "Store Owner"}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[#eab657]">
          <span className="h-px w-8 bg-[#eab657]/50" />
          <span className="text-[10px]">✦</span>
          <span className="h-px w-8 bg-[#eab657]/50" />
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#2c6e9b] text-white shadow-sm"
                  : "text-[#3d4f5c] hover:bg-black/5",
              )}
            >
              <Icon className="h-5 w-5" />
              {l.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handlePayouts}
          disabled={openingPayouts}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#3d4f5c] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CreditCardIcon className="h-5 w-5" />
          {openingPayouts ? "Opening Stripe..." : "Payouts"}
        </button>

        {comingSoon.map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={() => toast("Coming soon!")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#3d4f5c]/50 transition hover:bg-black/5"
          >
            <l.icon className="h-5 w-5" />
            {l.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="overflow-hidden rounded-2xl border border-[#2c6e9b]/15 shadow-sm">
          <Image
            src={Postcard}
            alt=""
            className="h-40 w-full object-cover object-left"
          />
        </div>
      </div>
    </aside>
  );
}
