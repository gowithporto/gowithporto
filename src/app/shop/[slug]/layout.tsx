import { locales } from "@/i18n";
import { resolveLocalized } from "@/lib/localizeContent";
import { PRODUCT_TRANSLATABLE_FIELDS as TRANSLATABLE_FIELDS, getProduct } from "@/lib/products";
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
  const raw = await getProduct(slug);

  if (!raw) return { title: "Product Not Found" };

  const product = resolveLocalized(raw, lang, TRANSLATABLE_FIELDS);

  const description =
    product.description?.slice(0, 155) ||
    `${product.title} — an authentic Porto souvenir, available on GoWithPorto.`;

  const image = product.images?.[0];

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = l === "en" ? `${BASE_URL}/shop/${slug}` : `${BASE_URL}/${l}/shop/${slug}`;
  }

  return {
    title: `${product.title} | GoWithPorto Shop`,
    description,
    alternates: { languages },
    openGraph: {
      title: product.title,
      description,
      images: image ? [image] : undefined,
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
        image: product.images?.length ? product.images : undefined,
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
