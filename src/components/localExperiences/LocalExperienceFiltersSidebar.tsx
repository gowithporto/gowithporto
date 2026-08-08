import { AdjustmentsHorizontalIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

import {
  DURATION_OPTIONS,
  formatExperienceLabel,
  getExperienceCategoryIcon,
} from "@/utils/experienceBadge";

export const MAX_PRICE = 150;

type Props = {
  categories: { name: string; count: number }[];
  totalCount: number;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  durationCounts: Record<string, number>;
  selectedDurations: string[];
  onToggleDuration: (value: string) => void;
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
};

export default function LocalExperienceFiltersSidebar({
  categories,
  totalCount,
  selectedCategory,
  onSelectCategory,
  durationCounts,
  selectedDurations,
  onToggleDuration,
  maxPrice,
  onMaxPriceChange,
}: Props) {
  return (
    <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[#2c6e9b]">
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        <h2 className="font-semibold">Filters</h2>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategory("")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition cursor-pointer ${
                selectedCategory === ""
                  ? "bg-[#2c6e9b] text-white"
                  : "text-[var(--text)] hover:bg-[#2c6e9b]/10"
              }`}
            >
              <span className="flex items-center gap-2">
                <Squares2X2Icon className="h-4 w-4" />
                All Experiences
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  selectedCategory === ""
                    ? "bg-white/20"
                    : "bg-[#2c6e9b]/10 text-[#2c6e9b]"
                }`}
              >
                {totalCount}
              </span>
            </button>
          </li>

          {categories.map((cat) => {
            const Icon = getExperienceCategoryIcon(cat.name);
            const isActive = selectedCategory === cat.name;
            return (
              <li key={cat.name}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition cursor-pointer ${
                    isActive
                      ? "bg-[#2c6e9b] text-white"
                      : "text-[var(--text)] hover:bg-[#2c6e9b]/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {formatExperienceLabel(cat.name)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? "bg-white/20" : "bg-[#2c6e9b]/10 text-[#2c6e9b]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--text)]">
          Duration
        </h3>
        <ul className="space-y-2">
          {DURATION_OPTIONS.map((d) => (
            <li key={d.value}>
              <label className="flex cursor-pointer items-center justify-between text-sm text-[var(--text)]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(d.value)}
                    onChange={() => onToggleDuration(d.value)}
                    className="h-4 w-4 rounded border-black/20 text-[#2c6e9b] focus:ring-[#2c6e9b]/30"
                  />
                  {d.label}
                </span>
                <span className="text-xs text-gray-400">
                  {durationCounts[d.value] || 0}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
          Price Range
        </h3>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={5}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-[#2c6e9b]"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span>€0</span>
          <span>
            {maxPrice >= MAX_PRICE ? `€${MAX_PRICE}+` : `€${maxPrice}`}
          </span>
        </div>
      </div>
    </div>
  );
}
