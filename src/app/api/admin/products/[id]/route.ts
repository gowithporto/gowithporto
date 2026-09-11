import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updateData = {
    title: body.title,
    slug: body.slug,
    description: body.description,
    price: body.price,
    category: body.category,
    images: body.images,
    quantity: body.quantity,
    active: body.active,
  };

  await connectDB();

  try {
    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const update: any = { $set: updateData };
    if (body.slug && body.slug !== existing.slug) {
      update.$addToSet = { previousSlugs: existing.slug };
    }

    const updated = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("storeId", "name");

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 11000 && error?.keyPattern?.slug) {
      return NextResponse.json(
        {
          error: `The slug "${body.slug}" is already used by another product. Please choose a different one.`,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
