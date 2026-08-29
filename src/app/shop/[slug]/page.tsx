import { headers } from "next/headers";
import { notFound } from "next/navigation";

import ProductDetailView from "@/components/shop/ProductDetailView";
import { resolveLocalized } from "@/lib/localizeContent";
import { PRODUCT_TRANSLATABLE_FIELDS, getProduct } from "@/lib/products";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const lang = hdrs.get("x-locale") || "en";

  const raw = await getProduct(slug);
  if (!raw) notFound();

  const product = resolveLocalized(raw, lang, PRODUCT_TRANSLATABLE_FIELDS);

  return <ProductDetailView product={product as any} />;
}
