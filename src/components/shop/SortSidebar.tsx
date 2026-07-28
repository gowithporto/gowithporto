import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
  BarsArrowDownIcon,
  BarsArrowUpIcon,
} from "@heroicons/react/24/outline";

const options = [
  { value: "", label: "Default", icon: ArrowsUpDownIcon },
  { value: "price-asc", label: "Price: Low → High", icon: BarsArrowUpIcon },
  { value: "price-desc", label: "Price: High → Low", icon: BarsArrowDownIcon },
  { value: "name-asc", label: "Name: A → Z", icon: Bars3BottomLeftIcon },
  { value: "name-desc", label: "Name: Z → A", icon: Bars3BottomLeftIcon },
];

type Props = {
  selected: string;
  onSelect: (sort: string) => void;
};

export default function SortSidebar({ selected, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[#2c6e9b]">
        <ArrowsUpDownIcon className="h-5 w-5" />
        <h2 className="font-semibold">Sort By</h2>
      </div>

      <ul className="space-y-1">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = selected === option.value;
          return (
            <li key={option.value || "default"}>
              <button
                type="button"
                onClick={() => onSelect(option.value)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition cursor-pointer ${
                  isActive
                    ? "bg-[#2c6e9b] text-white"
                    : "text-[var(--text)] hover:bg-[#2c6e9b]/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
