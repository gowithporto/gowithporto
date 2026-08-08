"use client";

import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  HomeIcon,
  LifebuoyIcon,
  MapPinIcon,
  SparklesIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

import Logo from "@/assets/GOWITHPORTO LOGO.png";
import { cn } from "@/utils/cn";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon, exact: true },
  { name: "Revenue", href: "/admin/revenue", icon: BanknotesIcon },
  { name: "Stores", href: "/admin/stores", icon: BuildingStorefrontIcon },
  { name: "Attractions", href: "/admin/attractions", icon: MapPinIcon },
  {
    name: "Local Experiences",
    href: "/admin/local-experiences",
    icon: SparklesIcon,
  },
  { name: "Bike Rentals", href: "/admin/bike-rentals", icon: TruckIcon },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBagIcon },
  { name: "Users", href: "/admin/users", icon: UserGroupIcon },
  { name: "AI Settings", href: "/admin/ai-settings", icon: CpuChipIcon },
];

const comingSoon = [
  { name: "Support", icon: LifebuoyIcon },
  { name: "Settings", icon: Cog6ToothIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-black/5 bg-white lg:flex">
      <div className="px-6 pt-6 pb-4">
        <Link href="/admin" className="block">
          <Image src={Logo} alt="GoWithPorto" width={170} height={44} priority />
        </Link>
        <p className="mt-2 font-serif text-lg font-semibold text-[#1d3d5c]">
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
                  : "text-[#3d4f5c] hover:bg-black/5",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}

        <div className="my-2 border-t border-black/5" />

        {comingSoon.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => toast("Coming soon!")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#3d4f5c]/50 transition hover:bg-black/5"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
