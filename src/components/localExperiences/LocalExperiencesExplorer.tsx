"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import LocalExperienceCard from "@/components/localExperiences/LocalExperienceCard";
import LocalExperienceFiltersSidebar, {
  MAX_PRICE,
} from "@/components/localExperiences/LocalExperienceFiltersSidebar";
import LocalExperiencesAiCta from "@/components/localExperiences/LocalExperiencesAiCta";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

export default function LocalExperiencesExplorer({
  experiences,
}: {
  experiences: any[];
}) {
  const [category, setCategory] = useState("");
  const [durations, setDurations] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);

  const toggleDuration = (value: string) => {
    setDurations((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
    setPage(1);
  };

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of experiences) {
      if (!e.category) continue;
      counts.set(e.category, (counts.get(e.category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [experiences]);

  const durationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of experiences) {
      if (!e.durationCategory) continue;
      counts[e.durationCategory] = (counts[e.durationCategory] || 0) + 1;
    }
    return counts;
  }, [experiences]);

  const visibleExperiences = useMemo(() => {
    let list = experiences;

    if (category) list = list.filter((e) => e.category === category);

    if (durations.length) {
      list = list.filter((e) => durations.includes(e.durationCategory));
    }

    if (maxPrice < MAX_PRICE) {
      list = list.filter((e) => (e.price ?? 0) <= maxPrice);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.title?.toLowerCase().includes(q));
    }

    list = [...list];
    if (sort === "price-asc") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price-desc") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      list.sort((a, b) => Number(b.popular) - Number(a.popular));
    }

    return list;
  }, [experiences, category, durations, maxPrice, search, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleExperiences.length / PAGE_SIZE));
  const pageExperiences = visibleExperiences.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const changeCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const changeMaxPrice = (value: number) => {
    setMaxPrice(value);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const changeSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-6">
        <LocalExperienceFiltersSidebar
          categories={categoryCounts}
          totalCount={experiences.length}
          selectedCategory={category}
          onSelectCategory={changeCategory}
          durationCounts={durationCounts}
          selectedDurations={durations}
          onToggleDuration={toggleDuration}
          maxPrice={maxPrice}
          onMaxPriceChange={changeMaxPrice}
        />
      </aside>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:border-[#2c6e9b] focus:ring-2 focus:ring-[#2c6e9b]/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-[var(--text)]">
          <span className="font-semibold text-[#2c6e9b]">
            {visibleExperiences.length}
          </span>{" "}
          Experiences Found
        </p>

        {visibleExperiences.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            No local experiences found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {pageExperiences.map((e) => (
                <LocalExperienceCard key={e._id} experience={e} />
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
                ))}

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

        <LocalExperiencesAiCta />
      </div>
    </div>
  );
}
