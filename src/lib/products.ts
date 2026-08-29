import { cache } from "react";

import { connectDB } from "@/lib/mongodb";
import "@/models";
import Product from "@/models/Product";

export const PRODUCT_TRANSLATABLE_FIELDS = ["title", "description"] as const;

/** Deduped per-request: layout.tsx (metadata/JSON-LD) and page.tsx (content) both call this for the same slug. */
export const getProduct = cache(async (slug: string) => {
  await connectDB();
  return Product.findOne({ slug, active: true })
    .populate("storeId", "name slug")
    .lean<any>();
});
