"use client";

import {
  ArrowLeftOnRectangleIcon,
  BellIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useLanguage } from "@/providers/LanguageProvider";

export default function AdminTopbar() {
  const { data: session } = useSession();
  const { lang, setLang } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const initial = (session?.user?.name || session?.user?.email || "A")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-end gap-3 border-b border-black/5 bg-white px-6 dark:border-white/10 dark:bg-[#0f1a24]">
      <div className="relative">
        <GlobeAltIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="cursor-pointer rounded-full border border-black/10 bg-white py-1.5 pr-3 pl-8 text-sm text-[#2c6e9b] dark:border-white/15 dark:bg-white/5 dark:text-white"
        >
          <option value="en">EN</option>
          <option value="pt">PT</option>
          <option value="fr">FR</option>
          <option value="es">ES</option>
          <option value="de">DE</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle theme"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#2c6e9b] transition hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
      >
        {isDark ? (
          <SunIcon className="h-4.5 w-4.5" />
        ) : (
          <MoonIcon className="h-4.5 w-4.5" />
        )}
      </button>

      <button
        type="button"
        onClick={() => toast("No new notifications")}
        aria-label="Notifications"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#2c6e9b] transition hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
      >
        <BellIcon className="h-4.5 w-4.5" />
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1d3d5c] text-sm font-semibold text-white transition hover:bg-[#1d3d5c]/90"
        >
          {initial}
        </button>

        {menuOpen && (
          <div className="absolute top-11 right-0 z-30 w-56 rounded-xl border border-black/5 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#111c27]">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium text-[#1d3d5c] dark:text-white">
                {session?.user?.name || "Admin"}
              </p>
              <p className="truncate text-xs text-black/40 dark:text-white/40">
                {session?.user?.email}
              </p>
            </div>
            <div className="my-1 border-t border-black/5 dark:border-white/10" />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
