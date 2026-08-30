import { sendAdminDisputeAlertForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

const REASON_CODES = [
  "buyer_not_present",
  "wrong_address",
  "buyer_refused",
  "item_issue",
  "other",
];

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`fulfill-confirm:${ip}:${token}`)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { reasonCode, note } = await req.json();
  if (!REASON_CODES.includes(reasonCode)) {
    return NextResponse.json(
      { success: false, error: "Invalid reason" },
      { status: 400 }
    );
  }

  await connectDB();

  const order = await Order.findOne({
    items: {
      $elemMatch: {
        fulfillmentToken: token,
        fulfillmentStatus: { $in: ["dispatched", "ready_for_pickup"] },
      },
    },
  });

  const item = order?.items.find((i: any) => i.fulfillmentToken === token);

  if (!order || !item) {
    return NextResponse.json(
      { success: false, error: "This confirmation link is no longer valid" },
      { status: 200 }
    );
  }

  item.fulfillmentStatus = "issue_reported";
  item.issueReport = {
    reportedBy: "handler",
    reasonCode,
    note: typeof note === "string" ? note.slice(0, 500) : undefined,
    reportedAt: new Date(),
  };

  await order.save();
  await sendAdminDisputeAlertForOrder(order, item, "handler");

  return NextResponse.json({ success: true });
}
