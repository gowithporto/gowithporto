import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
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
    variants: body.variants,
    active: body.active,
  };

  await connectDB();

  const updated = await Product.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      storeId: new mongoose.Types.ObjectId(session.user.storeId),
    },
    updateData,
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Product not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const deleted = await Product.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    storeId: new mongoose.Types.ObjectId(session.user.storeId),
  });

  if (!deleted) {
    return NextResponse.json(
      { error: "Product not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
