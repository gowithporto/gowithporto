import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const REASON_CODES = [
  "item_not_received",
  "item_defective_or_wrong",
  "no_longer_needed",
  "other",
];

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const { orderId, itemId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reasonCode, note } = await req.json();
  if (!REASON_CODES.includes(reasonCode)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  await connectDB();

  const order = await Order.findById(orderId);
  if (!order || order.userEmail !== session.user.email) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const item = order.items.id(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (!["dispatched", "ready_for_pickup"].includes(item.fulfillmentStatus)) {
    return NextResponse.json(
      { error: "This item is no longer eligible to report an issue" },
      { status: 400 }
    );
  }

  item.fulfillmentStatus = "issue_reported";
  item.issueReport = {
    reportedBy: "buyer",
    reasonCode,
    note: typeof note === "string" ? note.slice(0, 500) : undefined,
    reportedAt: new Date(),
  };

  await order.save();

  return NextResponse.json({ success: true });
}
