import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const orders = await Order.find({
    "items.fulfillmentStatus": "issue_reported",
  })
    .populate("storeId", "name")
    .sort({ createdAt: -1 });

  const disputes = orders.flatMap((order: any) =>
    order.items
      .filter((item: any) => item.fulfillmentStatus === "issue_reported")
      .map((item: any) => ({
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
      }))
  );

  return NextResponse.json(disputes);
}
