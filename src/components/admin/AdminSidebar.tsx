"use client";

import {
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  HomeIcon,
  LifebuoyIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

import Postcard from "@/assets/1. home page/discover_porto/9.png";
import Logo from "@/assets/GOWITHPORTO LOGO.png";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon, exact: true },
  { name: "Revenue", href: "/admin/revenue", icon: BanknotesIcon },
  { name: "Stores", href: "/admin/stores", icon: BuildingStorefrontIcon },
  { name: "Attractions", href: "/admin/attractions", icon: MapPinIcon },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "AI Settings", href: "/admin/ai-settings", icon: CpuChipIcon },
];

const comingSoon = [
  { name: "Users", icon: UserGroupIcon },
  { name: "Support", icon: LifebuoyIcon },
  { name: "Settings", icon: Cog6ToothIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-black/5 bg-white dark:border-white/10 dark:bg-[#0f1a24] lg:flex">
      <div className="px-6 pt-6 pb-4">
        <Link href="/admin" className="block">
          <Image src={Logo} alt="GoWithPorto" width={170} height={44} priority />
        </Link>
        <p className="mt-2 font-serif text-lg font-bold text-[#1d3d5c] dark:text-white">
          Admin Portal
        </p>
        <div className="mt-2 flex items-center gap-2 text-[#eab657]">
          <span className="h-px w-8 bg-[#eab657]/50" />
          <span className="text-[10px]">✦</span>
          <span className="h-px w-8 bg-[#eab657]/50" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navigation.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#2c6e9b] text-white shadow-sm"
                  : "text-[#3d4f5c] hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/5",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}

        <div className="my-2 border-t border-black/5 dark:border-white/10" />

        {comingSoon.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => toast("Coming soon!")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#3d4f5c]/50 transition hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/5"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="px-3">
        <div className="overflow-hidden rounded-2xl border border-[#2c6e9b]/15 shadow-sm">
          <Image
            src={Postcard}
            alt=""
            className="h-36 w-full object-cover"
          />
        </div>
        <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-black/40 dark:text-white/40">
          <BuildingStorefrontIcon className="h-3.5 w-3.5 text-[#2c6e9b]" />
          Authorized by Câmara Municipal do Porto
        </p>
      </div>

      <div className="space-y-3 border-t border-black/5 p-4 dark:border-white/10">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#3d4f5c] transition hover:bg-red-50 hover:text-red-600 dark:text-white/70 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Sign Out
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-black/2 px-3 py-2.5 dark:bg-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1d3d5c] text-sm font-semibold text-white">
            {(session?.user?.name || session?.user?.email || "A")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#1d3d5c] dark:text-white">
              {session?.user?.name || "Admin"}
            </p>
            <p className="truncate text-xs text-black/40 dark:text-white/40">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
