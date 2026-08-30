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
    description: body.description,
    price: body.price,
    category: body.category,
    images: body.images,
    quantity: body.quantity,
    active: body.active,
  };

  await connectDB();

  const updated = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("storeId", "name");

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
