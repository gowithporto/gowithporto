"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { date: Date; value: number };

const CHART_COLOR = "#2c6e9b";
const PAD = { top: 16, right: 12, bottom: 28, left: 56 };
const HEIGHT = 260;

function niceMax(value: number) {
  if (value <= 0) return 100;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = Math.pow(10, exponent);
  const residual = value / magnitude;
  let niceResidual: number;
  if (residual > 5) niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;
  else niceResidual = 1;
  return niceResidual * magnitude;
}

function formatEuro(value: number) {
  return `€${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function SalesChart({ data }: { data: Point[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const plotWidth = Math.max(width - PAD.left - PAD.right, 10);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const maxValue = useMemo(
    () => niceMax(Math.max(...data.map((d) => d.value), 0)),
    [data],
  );

  const xFor = (i: number) =>
    PAD.left +
    (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2);
  const yFor = (v: number) => PAD.top + plotHeight - (v / maxValue) * plotHeight;

  const linePath = useMemo(
    () =>
      data
        .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.value)}`)
        .join(" "),
    [data, plotWidth, plotHeight, maxValue],
  );

  const areaPath = useMemo(() => {
    if (data.length === 0) return "";
    const base = PAD.top + plotHeight;
    return `${linePath} L ${xFor(data.length - 1)} ${base} L ${xFor(0)} ${base} Z`;
  }, [linePath, data, plotWidth, plotHeight]);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => maxValue * f);

  // show at most ~6 x-axis labels
  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.min(
      1,
      Math.max(0, (x - PAD.left) / Math.max(plotWidth, 1)),
    );
    const idx = Math.round(fraction * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, idx)));
  };

  const hover = hoverIndex !== null ? data[hoverIndex] : null;
  const tooltipLeft = hoverIndex !== null ? xFor(hoverIndex) : 0;
  const tooltipFlip = tooltipLeft > width - 140;

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg
        width={width}
        height={HEIGHT}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.18} />
            <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="currentColor"
              className="text-black/[0.06] dark:text-white/[0.08]"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 10}
              y={yFor(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-black/40 text-[11px] dark:fill-white/40"
            >
              {formatEuro(t)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <text
              key={i}
              x={xFor(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-black/40 text-[11px] dark:fill-white/40"
            >
              {d.date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </text>
          ) : null,
        )}

        {data.length > 0 && (
          <>
            <path d={areaPath} fill="url(#salesArea)" stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke={CHART_COLOR}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {/* crosshair + active point */}
        {hover && hoverIndex !== null && (
          <>
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PAD.top}
              y2={PAD.top + plotHeight}
              stroke={CHART_COLOR}
              strokeOpacity={0.25}
              strokeWidth={1}
            />
            <circle
              cx={xFor(hoverIndex)}
              cy={yFor(hover.value)}
              r={5}
              fill={CHART_COLOR}
              stroke="white"
              strokeWidth={2}
              className="dark:stroke-[#111c27]"
            />
          </>
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-max rounded-lg border border-black/5 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-[#1a2733]"
          style={{
            left: tooltipFlip ? undefined : tooltipLeft + 12,
            right: tooltipFlip ? width - tooltipLeft + 12 : undefined,
          }}
        >
          <p className="text-black/50 dark:text-white/50">
            {hover.date.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="font-semibold text-[#1d3d5c] dark:text-white">
            {formatEuro(hover.value)}
          </p>
        </div>
      )}
    </div>
  );
}
