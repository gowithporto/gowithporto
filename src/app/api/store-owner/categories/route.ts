import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { slugifyCategory } from "@/lib/slugifyCategory";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, image } = await req.json();
  const trimmedName = (name || "").trim();

  if (!trimmedName) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const slug = slugifyCategory(trimmedName);

  await connectDB();

  // Upsert: if the category already exists (e.g. a race with another store
  // owner typing the same new category at once), keep its original image
  // rather than overwriting it.
  const category = await Category.findOneAndUpdate(
    { slug },
    { $setOnInsert: { name: trimmedName, slug, image } },
    { upsert: true, new: true },
  );

  return NextResponse.json({
    name: category.name,
    slug: category.slug,
    image: category.image,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, image } = await req.json();

  if (!slug || !image) {
    return NextResponse.json(
      { error: "slug and image are required" },
      { status: 400 },
    );
  }

  await connectDB();

  const category = await Category.findOneAndUpdate(
    { slug },
    { image },
    { new: true },
  );

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: category.name,
    slug: category.slug,
    image: category.image,
  });
}
