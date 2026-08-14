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
      .populate("storeId", "name slug")
      .lean();

    const localized = products.map((p) => resolveLocalized(p, lang, TRANSLATABLE_FIELDS));

    return NextResponse.json(localized);
  } catch (err) {
    console.error("PRODUCT API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
