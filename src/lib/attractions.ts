import { cache } from "react";

import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";

export const ATTRACTION_TRANSLATABLE_FIELDS = [
  "title",
  "shortDescription",
  "history",
  "highlights",
  "bestTimeToVisit",
  "openingHours",
  "entryFee",
  "howToGetThere",
] as const;

/** Deduped per-request: layout.tsx (metadata/JSON-LD) and page.tsx (content) both call this for the same slug. */
export const getAttraction = cache(async (slug: string) => {
  await connectDB();
  return Attraction.findOne({ slug, active: true }).lean<any>();
});
