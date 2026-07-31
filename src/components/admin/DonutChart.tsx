"use client";

export type DonutSlice = { label: string; value: number; color: string };

export default function DonutChart({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  let cursor = 0;
  const stops = slices.map((s) => {
    const start = total > 0 ? (cursor / total) * 360 : 0;
    cursor += s.value;
    const end = total > 0 ? (cursor / total) * 360 : 0;
    return `${s.color} ${start}deg ${end}deg`;
  });
  const gradient =
    total > 0 ? `conic-gradient(${stops.join(", ")})` : "#e5e7eb";

  return (
    <div className="flex items-center gap-6">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white text-center dark:bg-[#111c27]">
          <span className="text-lg font-bold text-[#1d3d5c] dark:text-white">
            {centerValue}
          </span>
          <span className="text-[10px] text-black/40 dark:text-white/40">
            {centerLabel}
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-black/60 dark:text-white/60">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
            <span className="whitespace-nowrap">
              <span className="font-semibold text-[#1d3d5c] dark:text-white">
                {total > 0 ? Math.round((s.value / total) * 100) : 0}%
              </span>
              <span className="ml-1.5 text-xs text-black/40 dark:text-white/40">
                {s.value}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
