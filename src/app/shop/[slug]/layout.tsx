import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import type { Metadata } from "next";
import { cache } from "react";

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
  const product = await getProduct(slug);

  if (!product) return { title: "Product Not Found" };

  const description =
    product.description?.slice(0, 155) ||
    `${product.title} — available on GoWithPorto, Porto's local souvenir marketplace.`;

  return {
    title: `${product.title} | GoWithPorto`,
    description,
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
  const product = await getProduct(slug);

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
