import { resolveDeliveryFee } from "@/lib/deliveryZones";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Store from "@/models/Store";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { items, city } = await req.json();

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

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

  const result = resolveDeliveryFee(store, city);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
