"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";

import AttractionCard from "@/components/attractions/AttractionCard";
import AttractionCategorySidebar from "@/components/attractions/AttractionCategorySidebar";
import AttractionsBanner from "@/components/attractions/AttractionsBanner";
import AttractionsFunFact from "@/components/attractions/AttractionsFunFact";
import AttractionsInfoStrip from "@/components/attractions/AttractionsInfoStrip";
import { useLanguage } from "@/providers/LanguageProvider";

const PAGE_SIZE = 6;

export default function AttractionsPage() {
  const { lang } = useLanguage();
  const [attractions, setAttractions] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/attractions?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => setAttractions(Array.isArray(data) ? data : []))
      .catch(() => setAttractions([]));
  }, [lang]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of attractions) {
      if (!a.category) continue;
      counts.set(a.category, (counts.get(a.category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [attractions]);

  const visibleAttractions = useMemo(() => {
    let list = attractions;

    if (category) list = list.filter((a) => a.category === category);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => a.title?.toLowerCase().includes(q));
    }

    return list;
  }, [attractions, category, search]);

  const totalPages = Math.max(1, Math.ceil(visibleAttractions.length / PAGE_SIZE));
  const pageAttractions = visibleAttractions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="space-y-10 px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <AttractionsBanner />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <AttractionCategorySidebar
            categories={categoryCounts}
            totalCount={attractions.length}
            selected={category}
            onSelect={setCategory}
          />
          <AttractionsFunFact />
        </aside>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--text)]">
              <span className="font-semibold text-[#2c6e9b]">
                {visibleAttractions.length}
              </span>{" "}
              Attractions Found
            </p>
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search attractions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
              />
            </div>
          </div>

          {visibleAttractions.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No attractions found.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pageAttractions.map((a) => (
                  <AttractionCard key={a._id} attraction={a} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[var(--text)] transition hover:bg-[#2c6e9b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition cursor-pointer ${
                          page === n
                            ? "bg-[#2c6e9b] text-white"
                            : "text-[var(--text)] hover:bg-[#2c6e9b]/10"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[var(--text)] transition hover:bg-[#2c6e9b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AttractionsInfoStrip />
    </div>
  );
}
