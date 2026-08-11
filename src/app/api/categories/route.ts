import { connectDB } from "@/lib/mongodb";
import { slugifyCategory } from "@/lib/slugifyCategory";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const categories = await Category.find({});
  const knownSlugs = new Set(categories.map((c) => c.slug));

  // Backfill: older products may reference a category string that predates
  // the Category collection (e.g. created before this feature existed).
  // Give it a Category doc — borrowing one of its products' photos as the
  // image — so it isn't treated as brand new the next time someone types it.
  const products = await Product.find(
    { category: { $exists: true, $ne: "" } },
    "category images variants",
  );

  const missing = new Map<string, { name: string; image?: string }>();
  for (const p of products) {
    if (!p.category) continue;
    const slug = slugifyCategory(p.category);
    if (knownSlugs.has(slug) || missing.has(slug)) continue;
    const image = p.images?.[0] || p.variants?.find((v: any) => v.image)?.image;
    missing.set(slug, { name: p.category, image });
  }

  if (missing.size > 0) {
    const toCreate = Array.from(missing.entries()).map(([slug, v]) => ({
      slug,
      name: v.name,
      image: v.image,
    }));
    await Category.insertMany(toCreate, { ordered: false }).catch(() => {});
    categories.push(...(toCreate as any));
  }

  return NextResponse.json(
    categories.map((c) => ({ name: c.name, slug: c.slug, image: c.image })),
    { headers: { "Cache-Control": "no-store" } },
  );
}
