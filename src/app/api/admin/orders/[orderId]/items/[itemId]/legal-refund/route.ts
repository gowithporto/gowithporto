import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Manual, low-volume path for post-confirmation legal-exception refunds (EU
// withdrawal/conformity rights) — the transfer to the seller already fired,
// so this has to pull funds back before refunding the card.
export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const { orderId, itemId } = await context.params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reason, amount } = await req.json();
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
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

  if (!["delivered", "picked_up"].includes(item.fulfillmentStatus)) {
    return NextResponse.json(
      { error: "This item was never confirmed delivered" },
      { status: 400 }
    );
  }

  if (!item.transferId) {
    return NextResponse.json(
      { error: "No transfer was ever made for this item" },
      { status: 400 }
    );
  }

  if (item.legalException?.processedAt) {
    return NextResponse.json(
      { error: "A legal refund has already been processed for this item" },
      { status: 409 }
    );
  }

  const refundAmount =
    typeof amount === "number" && amount > 0 ? amount : item.transferAmount;
  const amountCents = Math.round(refundAmount * 100);

  if (amountCents > Math.round((item.transferAmount || 0) * 100)) {
    return NextResponse.json(
      { error: "Amount exceeds what was transferred to the seller" },
      { status: 400 }
    );
  }

  try {
    const reversal = await stripe.transfers.createReversal(
      item.transferId,
      { amount: amountCents },
      { idempotencyKey: `reversal:${item.transferId}` }
    );

    const refund = await stripe.refunds.create(
      { payment_intent: order.paymentIntentId, amount: amountCents },
      { idempotencyKey: `legalrefund:${orderId}:${itemId}` }
    );

    item.legalException = {
      requested: true,
      reason: reason.trim(),
      amount: amountCents / 100,
      transferReversalId: reversal.id,
      refundId: refund.id,
      processedBy: session.user.email,
      processedAt: new Date(),
    };
  } catch (err: any) {
    return NextResponse.json(
      { error: `Stripe operation failed: ${err?.message || err}` },
      { status: 500 }
    );
  }

  await order.save();

  return NextResponse.json({ success: true, legalException: item.legalException });
}
