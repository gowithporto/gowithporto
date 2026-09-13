import { cache } from "react";

import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import LocalExperience from "@/models/LocalExperience";

export const LOCAL_EXPERIENCE_TRANSLATABLE_FIELDS = [
  "title",
  "shortDescription",
  "story",
  "highlights",
  "included",
  "meetingPoint",
  "groupSize",
  "cancellationPolicy",
] as const;

/** lean() still leaves ObjectId/Date instances on the object, which React's RSC
 *  serialization rejects as "not a plain object" when passed to a Client Component. */
function toPlain<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/** Deduped per-request: layout.tsx (metadata/JSON-LD) and page.tsx (content) both call this for the same slug. */
export const getExperience = cache(async (slug: string) => {
  await connectDB();
  const experience = await LocalExperience.findOne({ slug, active: true }).lean<any>();
  return experience ? toPlain(experience) : experience;
});

/** Deduped per-request: the /local-experiences listing page renders this server-side so search engines see the full list. */
export const getAllExperiences = cache(async (lang: string) => {
  await connectDB();
  const experiences = await LocalExperience.find({ active: true })
    .sort({ order: 1, title: 1 })
    .lean<any[]>();
  return toPlain(experiences).map((e: any) =>
    resolveLocalized(e, lang, LOCAL_EXPERIENCE_TRANSLATABLE_FIELDS),
  );
});
