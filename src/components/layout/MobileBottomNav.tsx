"use client";

import { locales, t } from "@/i18n";
import { useCartCount } from "@/hooks/useCartCount";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  SparklesIcon as SparklesIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "@/components/ui/LocalizedLink";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home", icon: HomeIcon, iconActive: HomeIconSolid, exact: true },
  { href: "/ai", labelKey: "nav.ai", icon: SparklesIcon, iconActive: SparklesIconSolid },
  { href: "/shop", labelKey: "nav.shop", icon: ShoppingBagIcon, iconActive: ShoppingBagIconSolid },
  {
    href: "/cart",
    labelKey: "nav.cart",
    icon: ShoppingCartIcon,
    iconActive: ShoppingCartIconSolid,
  },
  {
    href: "/dashboard",
    labelKey: "nav.profile",
    icon: UserCircleIcon,
    iconActive: UserCircleIconSolid,
    exact: true,
  },
];

// Strips a leading /fr, /es, /pt locale segment so active-state matching
// works the same regardless of the current language.
function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if ((locales as readonly string[]).includes(segments[1])) {
    const rest = "/" + segments.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/$/, "");
  }
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

export default function MobileBottomNav() {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const pathname = usePathname();
  const cartCount = useCartCount();

  if (session?.user?.role === "ADMIN" || session?.user?.role === "STORE_OWNER") {
    return null;
  }

  const currentPath = stripLocale(pathname);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-black/5 bg-white/80 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? currentPath === item.href
          : currentPath === item.href || currentPath.startsWith(item.href + "/");
        const Icon = isActive ? item.iconActive : item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px]"
          >
            <span className="relative">
              <Icon
                className={`h-6 w-6 ${isActive ? "text-[#2c6e9b]" : "text-[var(--text)]/50"}`}
              />
              {item.href === "/cart" && cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#eab657] text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span
              className={
                isActive
                  ? "font-medium text-[#2c6e9b]"
                  : "text-[var(--text)]/50"
              }
            >
              {t(lang, item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
