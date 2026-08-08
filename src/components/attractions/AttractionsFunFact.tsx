import Image from "next/image";

import towerIcon from "@/assets/1. home page/popular_categories/map.png";

export default function AttractionsFunFact() {
  return (
    <div className="rounded-2xl border border-[#eab657]/20 bg-white p-5 text-center shadow-sm">
      <Image
        src={towerIcon}
        alt=""
        width={28}
        height={28}
        className="mx-auto h-16 w-16 object-contain"
      />
      <p className="mt-3 font-serif text-sm font-semibold text-[var(--primary)]">
        Did you know?
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        Porto&apos;s historic Ribeira district is a UNESCO World Heritage Site,
        recognised since 1996 for its unbroken medieval layout.
      </p>
      <div className="mt-3 flex items-center justify-center gap-2 text-[#eab657]">
        <span className="h-px w-8 bg-[#eab657]/50" />
        <span className="text-[10px]">✦</span>
        <span className="h-px w-8 bg-[#eab657]/50" />
      </div>
    </div>
  );
}
