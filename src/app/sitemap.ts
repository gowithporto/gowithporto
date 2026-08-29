import { locales } from "@/i18n";
import { isShopEnabled } from "@/lib/marketplace";
import { connectDB } from "@/lib/mongodb";
import Attraction from "@/models/Attraction";
import LocalExperience from "@/models/LocalExperience";
import Product from "@/models/Product";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

function localizedEntry(
  path: string,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] =
      locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  }

  return {
    url: `${BASE_URL}${path}`,
    lastModified,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const [products, attractions, experiences] = await Promise.all([
    Product.find({ active: true }).select("slug updatedAt").lean<any[]>(),
    Attraction.find({ active: true }).select("slug updatedAt").lean<any[]>(),
    LocalExperience.find({ active: true })
      .select("slug updatedAt")
      .lean<any[]>(),
  ]);

  const staticPaths = ["/", "/shop", "/attractions", "/local-experiences", "/ai"];
  const shopEnabled = isShopEnabled();

  return [
    ...staticPaths.map((path) => localizedEntry(path)),
    // Individual product pages redirect to /shop while the marketplace is gated off — don't submit URLs that 307.
    ...(shopEnabled
      ? products.map((p) => localizedEntry(`/shop/${p.slug}`, p.updatedAt))
      : []),
    ...attractions.map((a) =>
      localizedEntry(`/attractions/${a.slug}`, a.updatedAt),
    ),
    ...experiences.map((e) =>
      localizedEntry(`/local-experiences/${e.slug}`, e.updatedAt),
    ),
  ];
}
