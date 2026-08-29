"use client";

import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = (session?.user?.name || session?.user?.email || "A")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-white px-4 lg:justify-end lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#2c6e9b] transition hover:bg-black/5 lg:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => toast("No new notifications")}
        aria-label="Notifications"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#2c6e9b] transition hover:bg-black/5"
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
          <div className="absolute top-11 right-0 z-30 w-56 rounded-xl border border-black/5 bg-white p-2 shadow-lg">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium text-[#1d3d5c]">
                {session?.user?.name || "Admin"}
              </p>
              <p className="truncate text-xs text-black/40">
                {session?.user?.email}
              </p>
            </div>
            <div className="my-1 border-t border-black/5" />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
