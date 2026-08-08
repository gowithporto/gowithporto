"use client";

import {
  BookmarkIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HeartIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowRightFromBracket } from "react-icons/fa6";

import profileBg from "@/assets/6. user dashboard page/profile background.png";
import defaultAvatar from "@/assets/6. user dashboard page/profile.png";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "AI History", href: "/dashboard/ai-history", icon: SparklesIcon },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBagIcon },
  { name: "Transactions", href: "/dashboard/transactions", icon: CreditCardIcon },
  { name: "Profile Settings", href: "/dashboard/profile", icon: Cog6ToothIcon },
];

const comingSoonItems = [
  { name: "Saved Trips", icon: BookmarkIcon },
  { name: "Favorites", icon: HeartIcon },
  { name: "Membership", icon: TrophyIcon, badge: "Premium" },
  { name: "Help Center", icon: QuestionMarkCircleIcon },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [memberSince, setMemberSince] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.memberSince) {
          setMemberSince(
            new Date(data.memberSince).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            }),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-6">
      {/* Profile + Nav card */}
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <Image
          src={profileBg}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-6 top-0 h-auto w-40 select-none opacity-70"
        />

        <div className="relative p-6">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md">
            <Image
              src={session?.user?.image || defaultAvatar}
              alt={session?.user?.name || "Traveler"}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="mt-3 font-serif text-lg font-medium text-[#173d5c]">
            {session?.user?.name || "Traveler"}
          </p>
          <p className="flex items-center gap-1 text-xs font-medium text-[#eab657]">
            Premium Member <TrophyIcon className="h-3.5 w-3.5" />
          </p>
          {memberSince && (
            <p className="mt-1 text-xs text-gray-400">
              Member since {memberSince}
            </p>
          )}
        </div>

        <nav className="relative space-y-1 px-3 pb-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#2c6e9b]/10 font-medium text-[#2c6e9b]"
                    : "text-[var(--text)] hover:bg-black/[0.03]"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}

          <div className="my-2 border-t border-black/5" />

          {comingSoonItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => toast("Coming soon!")}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-black/[0.03] cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </span>
              {item.badge && (
                <span className="rounded-full bg-[#eab657]/15 px-2 py-0.5 text-[10px] font-semibold text-[#b8863a]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="my-2 border-t border-black/5" />

          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 cursor-pointer"
          >
            <FaArrowRightFromBracket className="h-4 w-4" />
            Log Out
          </button>
        </nav>
      </div>

      {/* Tourism board ad */}
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-[#eaf3fa] p-6">
        <p className="text-xs font-medium text-[#2c6e9b]">
          Officially Inspired by
        </p>
        <p className="font-serif text-2xl font-medium text-[#173d5c]">Porto.</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text)]">
          <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-[#2c6e9b]" />
          <span>
            In partnership with
            <br />
            <span className="font-medium">Porto Tourism Board</span>
          </span>
        </div>
      </div>

      {/* Trust card */}
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <ShieldCheckIcon className="h-6 w-6 text-[#2c6e9b]" />
        <p className="mt-2 text-sm font-medium text-[var(--text)]">
          Secure &amp; Trusted
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Your data is safe and never shared.
        </p>
        <Link
          href="/privacy"
          className="mt-2 inline-block text-xs font-medium text-[#2c6e9b] hover:underline"
        >
          Learn more &rarr;
        </Link>
      </div>
    </aside>
  );
}
