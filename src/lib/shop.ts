import { cache } from "react";

import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import { slugifyCategory } from "@/lib/slugifyCategory";
import "@/models";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Store from "@/models/Store";

const PRODUCT_TRANSLATABLE_FIELDS = ["title", "description"] as const;

/** Deduped per-request: the /shop landing page renders this server-side so search engines see the category grid. */
export const getShopHome = cache(async (lang: string) => {
  await connectDB();

  const [products, categories, stores] = await Promise.all([
    Product.find({ active: true })
      .populate({ path: "storeId", match: { active: true }, select: "name slug" })
      .lean<any[]>(),
    Category.find({}).lean<any[]>(),
    Store.find({ active: true })
      .select("name slug location tagline logoUrl bannerUrl")
      .sort({ name: 1 })
      .lean<any[]>(),
  ]);

  // populate's `match` doesn't exclude the product itself when the store
  // doesn't match — it just nulls out storeId — so a deactivated store's
  // products must be filtered out here to actually disappear from the shop.
  const activeStoreProducts = products.filter((p: any) => p.storeId);
  const localizedProducts = activeStoreProducts.map((p) =>
    resolveLocalized(p, lang, PRODUCT_TRANSLATABLE_FIELDS),
  );

  const counts = new Map<string, number>();
  for (const p of localizedProducts) {
    if (!p.category) continue;
    counts.set(slugifyCategory(p.category), (counts.get(slugifyCategory(p.category)) || 0) + 1);
  }

  const categoryTiles = categories
    .map((c) => ({
      name: c.name as string,
      slug: c.slug as string,
      image: c.image as string | undefined,
      count: counts.get(c.slug) || 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return { categoryTiles, stores };
});
