import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const orders = await Order.find({
    $or: [
      { "items.fulfillmentStatus": "issue_reported" },
      {
        "items.fulfillmentStatus": { $in: ["dispatched", "ready_for_pickup"] },
        "items.dispatchedAt": { $lte: new Date(Date.now() - STALE_THRESHOLD_MS) },
      },
    ],
  })
    .populate("storeId", "name")
    .sort({ createdAt: -1 });

  const staleCutoff = Date.now() - STALE_THRESHOLD_MS;

  const disputes = orders.flatMap((order: any) =>
    order.items
      .filter(
        (item: any) =>
          item.fulfillmentStatus === "issue_reported" ||
          (["dispatched", "ready_for_pickup"].includes(item.fulfillmentStatus) &&
            item.dispatchedAt &&
            new Date(item.dispatchedAt).getTime() <= staleCutoff)
      )
      .map((item: any) => {
        const isStale = item.fulfillmentStatus !== "issue_reported";
        return {
          type: isStale ? "stale" : "reported",
          orderId: order._id.toString(),
          itemId: item._id.toString(),
          storeName: order.storeId?.name || "Unknown store",
          buyerEmail: order.userEmail,
          itemTitle: item.title,
          quantity: item.quantity,
          price: item.price,
          deliveryType: order.deliveryType,
          deliveryFee: order.deliveryFee,
          reportedBy: item.issueReport?.reportedBy,
          reasonCode: item.issueReport?.reasonCode,
          note: item.issueReport?.note,
          reportedAt: item.issueReport?.reportedAt,
          dispatchedAt: item.dispatchedAt,
          etaText: item.etaText,
        };
      })
  );

  return NextResponse.json(disputes);
}
