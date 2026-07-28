const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Builds a "MMM d – MMM d, yyyy" range starting from `startDate` (yyyy-mm-dd)
 * for the given trip length. Falls back to today when no start date was
 * captured (the field is optional on the planner form).
 */
export function formatTripDateRange(
  startDate: string | undefined,
  days: number,
) {
  const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + Math.max(0, days - 1) * MS_PER_DAY);

  const startFmt = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endFmt = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFmt} – ${endFmt}`;
}
