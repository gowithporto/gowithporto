import { headers } from "next/headers";
import { notFound } from "next/navigation";

import AttractionDetailView from "@/components/attractions/AttractionDetailView";
import { ATTRACTION_TRANSLATABLE_FIELDS, getAttraction } from "@/lib/attractions";
import { resolveLocalized } from "@/lib/localizeContent";

export default async function AttractionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";

  const raw = await getAttraction(slug);
  if (!raw) notFound();

  const attraction = resolveLocalized(raw, lang, ATTRACTION_TRANSLATABLE_FIELDS);

  return <AttractionDetailView attraction={attraction as any} />;
}
