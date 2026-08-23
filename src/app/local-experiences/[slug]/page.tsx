import { headers } from "next/headers";
import { notFound } from "next/navigation";

import LocalExperienceDetailView from "@/components/localExperiences/LocalExperienceDetailView";
import {
  LOCAL_EXPERIENCE_TRANSLATABLE_FIELDS,
  getExperience,
} from "@/lib/localExperiences";
import { resolveLocalized } from "@/lib/localizeContent";

export default async function LocalExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";

  const raw = await getExperience(slug);
  if (!raw) notFound();

  const experience = resolveLocalized(raw, lang, LOCAL_EXPERIENCE_TRANSLATABLE_FIELDS);

  return <LocalExperienceDetailView experience={experience as any} />;
}
