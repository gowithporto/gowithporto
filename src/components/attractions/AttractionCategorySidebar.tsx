import {
  AdjustmentsHorizontalIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  EyeIcon,
  GlobeAltIcon,
  MapIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  SunIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

function getCategoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("church")) return BuildingOffice2Icon;
  if (c.includes("museum")) return BuildingLibraryIcon;
  if (c.includes("view")) return EyeIcon;
  if (c.includes("beach")) return SunIcon;
  if (c.includes("bridge")) return MapIcon;
  if (c.includes("market")) return ShoppingBagIcon;
  if (c.includes("garden") || c.includes("park")) return GlobeAltIcon;
  return TagIcon;
}

function formatLabel(category: string) {
  return category.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  categories: { name: string; count: number }[];
  totalCount: number;
  selected: string;
  onSelect: (category: string) => void;
};

export default function AttractionCategorySidebar({
  categories,
  totalCount,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[#2c6e9b]">
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        <h2 className="font-semibold">Categories</h2>
      </div>

      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onSelect("")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition cursor-pointer ${
              selected === ""
                ? "bg-[#2c6e9b] text-white"
                : "text-[var(--text)] hover:bg-[#2c6e9b]/10"
            }`}
          >
            <span className="flex items-center gap-2">
              <Squares2X2Icon className="h-4 w-4" />
              All Attractions
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                selected === "" ? "bg-white/20" : "bg-[#2c6e9b]/10 text-[#2c6e9b]"
              }`}
            >
              {totalCount}
            </span>
          </button>
        </li>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const isActive = selected === cat.name;
          return (
            <li key={cat.name}>
              <button
                type="button"
                onClick={() => onSelect(cat.name)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition cursor-pointer ${
                  isActive
                    ? "bg-[#2c6e9b] text-white"
                    : "text-[var(--text)] hover:bg-[#2c6e9b]/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {formatLabel(cat.name)}
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
  );
}
