import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Promotes a stale (dispatched/ready_for_pickup, unconfirmed >24h) item into
// a normal reported dispute — no Stripe call here. Admin investigates
// (contacting the store owner and/or buyer) and resolves it afterward
// through the existing seller_fault/buyer_fault/split flow, unchanged.
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

  item.fulfillmentStatus = "issue_reported";
  item.issueReport = {
    reportedBy: "system",
    reasonCode: "unconfirmed_after_timeout",
    reportedAt: new Date(),
  };

  await order.save();

  return NextResponse.json({ success: true });
}
