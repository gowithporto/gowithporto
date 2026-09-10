import { cache } from "react";

import { resolveLocalized } from "@/lib/localizeContent";
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

/** Deduped per-request: the /attractions listing page renders this server-side so search engines see the full list. */
export const getAllAttractions = cache(async (lang: string) => {
  await connectDB();
  const attractions = await Attraction.find({ active: true })
    .sort({ order: 1, title: 1 })
    .lean<any[]>();
  return attractions.map((a) => resolveLocalized(a, lang, ATTRACTION_TRANSLATABLE_FIELDS));
});
