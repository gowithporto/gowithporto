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

/** lean() still leaves ObjectId/Date instances on the object, which React's RSC
 *  serialization rejects as "not a plain object" when passed to a Client Component. */
function toPlain<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/** Deduped per-request: layout.tsx (metadata/JSON-LD) and page.tsx (content) both call this for the same slug. */
export const getAttraction = cache(async (slug: string) => {
  await connectDB();
  const attraction = await Attraction.findOne({ slug, active: true }).lean<any>();
  return attraction ? toPlain(attraction) : attraction;
});

/** Deduped per-request: the /attractions listing page renders this server-side so search engines see the full list. */
export const getAllAttractions = cache(async (lang: string) => {
  await connectDB();
  const attractions = await Attraction.find({ active: true })
    .sort({ order: 1, title: 1 })
    .lean<any[]>();
  return toPlain(attractions).map((a: any) =>
    resolveLocalized(a, lang, ATTRACTION_TRANSLATABLE_FIELDS)
  );
});
