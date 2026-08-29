import { resolveLocalized } from "@/lib/localizeContent";
import { connectDB } from "@/lib/mongodb";
import "@/models";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

const TRANSLATABLE_FIELDS = ["title", "description"] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectDB();

  const { slug } = await params;
  const lang = req.nextUrl.searchParams.get("lang") || "en";

  const product = await Product.findOne({ slug })
    .populate("storeId", "name slug")
    .lean();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(resolveLocalized(product, lang, TRANSLATABLE_FIELDS));
}
