import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";
import type { Metadata } from "next";
import { cache } from "react";

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
  const attraction = await getAttraction(slug);

  if (!attraction) return { title: "Attraction Not Found" };

  const description =
    attraction.shortDescription?.slice(0, 155) ||
    `${attraction.title} — a top Porto attraction, with visitor tips on GoWithPorto.`;

  const image = attraction.gallery?.[0] || attraction.coverImage;

  return {
    title: `${attraction.title} | GoWithPorto`,
    description,
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
  const attraction = await getAttraction(slug);

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
