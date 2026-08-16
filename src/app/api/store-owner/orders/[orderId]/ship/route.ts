import { authOptions } from "@/lib/auth";
import { sendOrderShippedForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params; // ✅ FIX

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const storeObjectId = new mongoose.Types.ObjectId(session.user.storeId);

  // Get store product IDs
  const storeProducts = await Product.find(
    { storeId: storeObjectId },
    { _id: 1 }
  );

  const productIds = storeProducts.map((p) => p._id.toString());

  // Fetch order
  const order = await Order.findById(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentIntentId) {
    return NextResponse.json(
      {
        error:
          "This order uses per-item fulfillment — dispatch items individually.",
      },
      { status: 400 }
    );
  }

  // Ensure this store owns at least one item
  const ownsItems = order.items.some((item: any) =>
    productIds.includes(item.productId.toString())
  );

  if (!ownsItems) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Order cannot be shipped" },
      { status: 400 }
    );
  }

  const isPickup = order.deliveryType
    ? order.deliveryType === "pickup"
    : !order.address;

  order.status = "shipped";
  await order.save();

  // Pickup orders are handed over in person — the "on its way" shipped
  // email is only accurate for orders actually going out for delivery.
  if (!isPickup) {
    await sendOrderShippedForOrder(order);
  }

  return NextResponse.json({ success: true });
}
