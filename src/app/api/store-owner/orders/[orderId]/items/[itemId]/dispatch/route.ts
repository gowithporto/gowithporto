import { authOptions } from "@/lib/auth";
import {
  sendOrderDispatchedForOrder,
  sendOrderReadyForPickupForOrder,
} from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { generateFulfillmentToken } from "@/lib/tokens";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const { orderId, itemId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { etaText } = await req.json();
  if (!etaText || typeof etaText !== "string" || !etaText.trim()) {
    return NextResponse.json(
      { error: "Estimated time is required" },
      { status: 400 }
    );
  }

  await connectDB();

  const storeObjectId = new mongoose.Types.ObjectId(session.user.storeId);
  const storeProducts = await Product.find(
    { storeId: storeObjectId },
    { _id: 1 }
  );
  const productIds = storeProducts.map((p) => p._id.toString());

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!order.paymentIntentId) {
    return NextResponse.json(
      {
        error:
          "This order uses the legacy fulfillment flow — use Mark as Shipped instead.",
      },
      { status: 400 }
    );
  }

  const item = order.items.id(itemId);
  if (!item || !productIds.includes(item.productId.toString())) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.fulfillmentStatus !== "pending") {
    return NextResponse.json(
      { error: "Item has already been dispatched" },
      { status: 400 }
    );
  }

  const isPickup = order.deliveryType === "pickup";

  item.fulfillmentToken = generateFulfillmentToken();
  item.fulfillmentStatus = isPickup ? "ready_for_pickup" : "dispatched";
  item.etaText = etaText.trim();
  item.dispatchedAt = new Date();

  await order.save();

  if (isPickup) {
    await sendOrderReadyForPickupForOrder(order, item, session.user.storeName);
  } else {
    await sendOrderDispatchedForOrder(order, item);
  }

  return NextResponse.json({ success: true });
}
