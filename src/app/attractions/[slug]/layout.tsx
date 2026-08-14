import { locales } from "@/i18n";
import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

const TRANSLATABLE_FIELDS = [
  "title",
  "shortDescription",
  "history",
  "highlights",
  "bestTimeToVisit",
  "openingHours",
  "entryFee",
  "howToGetThere",
] as const;

const getAttraction = cache(async (slug: string) => {
  await connectDB();
  return Attraction.findOne({ slug, active: true }).lean<any>();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const raw = await getAttraction(slug);

  if (!raw) return { title: "Attraction Not Found" };

  const attraction = resolveLocalized(raw, lang, TRANSLATABLE_FIELDS);

  const description =
    attraction.shortDescription?.slice(0, 155) ||
    `${attraction.title} — a top Porto attraction, with visitor tips on GoWithPorto.`;

  const image = attraction.gallery?.[0] || attraction.coverImage;

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = l === "en" ? `${BASE_URL}/attractions/${slug}` : `${BASE_URL}/${l}/attractions/${slug}`;
  }

  return {
    title: `${attraction.title} | GoWithPorto`,
    description,
    alternates: { languages },
    openGraph: {
      title: attraction.title,
      description,
      images: image ? [image] : undefined,
      type: "website",
    },
  };
}

export default async function AttractionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const raw = await getAttraction(slug);
  const attraction = raw ? resolveLocalized(raw, lang, TRANSLATABLE_FIELDS) : null;

  const jsonLd = attraction
    ? {
        "@context": "https://schema.org",
        "@type": "TouristAttraction",
        name: attraction.title,
        description: attraction.shortDescription || attraction.history,
        image: attraction.gallery?.length
          ? attraction.gallery
          : attraction.coverImage
            ? [attraction.coverImage]
            : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: attraction.area || "Porto",
          addressCountry: "PT",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
