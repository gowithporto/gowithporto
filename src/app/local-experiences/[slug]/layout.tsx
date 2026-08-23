import { locales } from "@/i18n";
import {
  LOCAL_EXPERIENCE_TRANSLATABLE_FIELDS as TRANSLATABLE_FIELDS,
  getExperience,
} from "@/lib/localExperiences";
import { resolveLocalized } from "@/lib/localizeContent";
import type { Metadata } from "next";
import { headers } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const raw = await getExperience(slug);

  if (!raw) return { title: "Experience Not Found" };

  const experience = resolveLocalized(raw, lang, TRANSLATABLE_FIELDS);

  const description =
    experience.shortDescription?.slice(0, 155) ||
    `${experience.title} — a local Porto experience, bookable on GoWithPorto.`;

  const image = experience.gallery?.[0] || experience.coverImage;

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] =
      l === "en" ? `${BASE_URL}/local-experiences/${slug}` : `${BASE_URL}/${l}/local-experiences/${slug}`;
  }

  return {
    title: `${experience.title} | GoWithPorto`,
    description,
    alternates: { languages },
    openGraph: {
      title: experience.title,
      description,
      images: image ? [image] : undefined,
      type: "website",
    },
  };
}

export default async function LocalExperienceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const raw = await getExperience(slug);
  const experience = raw ? resolveLocalized(raw, lang, TRANSLATABLE_FIELDS) : null;

  const jsonLd = experience
    ? {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        name: experience.title,
        description: experience.shortDescription || experience.story,
        image: experience.gallery?.length
          ? experience.gallery
          : experience.coverImage
            ? [experience.coverImage]
            : undefined,
        ...(experience.price != null && {
          offers: {
            "@type": "Offer",
            price: experience.price,
            priceCurrency: "EUR",
          },
        }),
        ...(experience.rating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: experience.rating,
            reviewCount: experience.reviewCount || 1,
          },
        }),
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
