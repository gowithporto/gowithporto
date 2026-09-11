import { cache } from "react";

import { connectDB } from "@/lib/mongodb";
import "@/models";
import Product from "@/models/Product";

export const PRODUCT_TRANSLATABLE_FIELDS = ["title", "description"] as const;

/** Deduped per-request: layout.tsx (metadata/JSON-LD) and page.tsx (content) both call this for the same slug. */
export const getProduct = cache(async (slug: string) => {
  await connectDB();
  const product = await Product.findOne({ slug, active: true })
    .populate({ path: "storeId", match: { active: true }, select: "name slug" })
    .lean<any>();

  // A deactivated store nulls out storeId via populate's `match` rather than
  // excluding the product — treat that as not-found so the page 404s.
  return product?.storeId ? product : null;
});

/** Looks up the current slug for a product that used to answer to `slug`, so a stale/old URL can be redirected instead of 404ing. */
export const getCurrentSlugForRetiredSlug = cache(async (slug: string) => {
  await connectDB();
  const product = await Product.findOne({ previousSlugs: slug, active: true })
    .select("slug")
    .lean<any>();
  return product?.slug || null;
});
