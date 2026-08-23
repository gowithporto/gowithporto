import { cache } from "react";

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

/** Deduped per-request: layout.tsx (metadata/JSON-LD) and page.tsx (content) both call this for the same slug. */
export const getExperience = cache(async (slug: string) => {
  await connectDB();
  return LocalExperience.findOne({ slug, active: true }).lean<any>();
});
