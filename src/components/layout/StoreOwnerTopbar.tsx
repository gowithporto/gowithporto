"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";

export default function StoreOwnerTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex h-14 shrink-0 items-center border-b border-black/5 bg-white px-4 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open store menu"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#2c6e9b] transition hover:bg-black/5"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <p className="ml-3 font-serif text-base font-semibold text-[#1d3d5c]">
        Store Dashboard
      </p>
    </div>
  );
}
