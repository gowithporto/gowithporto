import { connectDB } from "@/lib/mongodb";
import LocalExperience from "@/models/LocalExperience";
import type { Metadata } from "next";
import { cache } from "react";

const getExperience = cache(async (slug: string) => {
  await connectDB();
  return LocalExperience.findOne({ slug, active: true }).lean<any>();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience) return { title: "Experience Not Found" };

  const description =
    experience.shortDescription?.slice(0, 155) ||
    `${experience.title} — a local Porto experience, bookable on GoWithPorto.`;

  const image = experience.gallery?.[0] || experience.coverImage;

  return {
    title: `${experience.title} | GoWithPorto`,
    description,
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
  const experience = await getExperience(slug);

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
