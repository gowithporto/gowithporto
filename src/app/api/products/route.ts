import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

const TRANSLATABLE_FIELDS = ["title", "description"] as const;

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const lang = searchParams.get("lang") || "en";

    const filter: any = { active: true };

    if (category) {
      filter.category = category;
    }

    let sortOption: any = {};

    if (sort === "price-asc") sortOption.price = 1;
    if (sort === "price-desc") sortOption.price = -1;
    if (sort === "name-asc") sortOption.title = 1;
    if (sort === "name-desc") sortOption.title = -1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .populate({ path: "storeId", match: { active: true }, select: "name slug" })
      .lean();

    // populate's `match` doesn't exclude the product itself when the store
    // doesn't match — it just nulls out storeId — so a deactivated store's
    // products must be filtered out here to actually disappear from the shop.
    const activeStoreProducts = products.filter((p: any) => p.storeId);

    const localized = activeStoreProducts.map((p) => resolveLocalized(p, lang, TRANSLATABLE_FIELDS));

    return NextResponse.json(localized);
  } catch (err) {
    console.error("PRODUCT API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
