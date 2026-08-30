import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Store from "@/models/Store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { items } = await req.json();

  await connectDB();

  const products = await Product.find({
    _id: { $in: items.map((i: any) => i.productId) },
  });

  if (products.length === 0) {
    return NextResponse.json({ error: "No products found" }, { status: 404 });
  }

  const store = await Store.findById(products[0].storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({
    storeId: store._id,
    name: store.name,
    location: store.location,
    googleMapsLink: store.googleMapsLink || null,
  });
}
