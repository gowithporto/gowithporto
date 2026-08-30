import { authOptions } from "@/lib/auth";
import { confirmItemFulfillment } from "@/lib/confirmFulfillment";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const { orderId, itemId } = await context.params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const item = order.items.id(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (!["dispatched", "ready_for_pickup"].includes(item.fulfillmentStatus)) {
    return NextResponse.json(
      { error: "This item is not awaiting confirmation" },
      { status: 400 }
    );
  }

  const store = await Store.findById(order.storeId);

  await confirmItemFulfillment(order, item, store);

  await order.save();

  return NextResponse.json({ success: true });
}
