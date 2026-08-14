import { locales } from "@/i18n";
import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

const TRANSLATABLE_FIELDS = ["title", "description"] as const;

const getProduct = cache(async (slug: string) => {
  await connectDB();
  return Product.findOne({ slug, active: true }).lean<any>();
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const raw = await getProduct(slug);

  if (!raw) return { title: "Product Not Found" };

  const product = resolveLocalized(raw, lang, TRANSLATABLE_FIELDS);

  const description =
    product.description?.slice(0, 155) ||
    `${product.title} — available on GoWithPorto, Porto's local souvenir marketplace.`;

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = l === "en" ? `${BASE_URL}/shop/${slug}` : `${BASE_URL}/${l}/shop/${slug}`;
  }

  return {
    title: `${product.title} | GoWithPorto`,
    description,
    alternates: { languages },
    openGraph: {
      title: product.title,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
      type: "website",
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";
  const raw = await getProduct(slug);
  const product = raw ? resolveLocalized(raw, lang, TRANSLATABLE_FIELDS) : null;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        image: product.images,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "EUR",
          availability:
            (product.quantity || 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
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
