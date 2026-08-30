import { authOptions } from "@/lib/auth";
import { sendDisputeResolvedForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!);

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string; itemId: string }> }
) {
  const { orderId, itemId } = await context.params;

  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { outcome, buyerPct, sellerPct, notes } = await req.json();

  if (!["seller_fault", "buyer_fault", "split"].includes(outcome)) {
    return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
  }

  if (outcome === "split") {
    if (
      typeof buyerPct !== "number" ||
      typeof sellerPct !== "number" ||
      buyerPct < 0 ||
      sellerPct < 0 ||
      buyerPct + sellerPct > 100
    ) {
      return NextResponse.json(
        { error: "Invalid split percentages" },
        { status: 400 }
      );
    }
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

  // Idempotency: an item can only be resolved once — reject before any Stripe call.
  if (item.fulfillmentStatus !== "issue_reported") {
    return NextResponse.json(
      { error: "This item has already been resolved" },
      { status: 409 }
    );
  }

  const store = await Store.findById(order.storeId);
  const canTransfer = !!(store?.stripeAccountId && store?.stripeOnboardingComplete);
  const itemAmountCents = Math.round(item.price * item.quantity * 100);

  // Only a single-item order lets us unambiguously tie the delivery fee back
  // to this one item's outcome — multi-item delivery-fee handling on seller
  // fault is left as a manual follow-up rather than guessed at automatically.
  const singleItemOrder = order.items.length === 1;
  const hasUntransferredDeliveryFee =
    order.deliveryType === "delivery" &&
    order.deliveryFee > 0 &&
    !order.deliveryFeeTransferred;

  let resolution: Record<string, unknown> = {
    outcome,
    resolvedBy: session.user.email,
    resolvedAt: new Date(),
    notes,
  };

  try {
    if (outcome === "seller_fault") {
      const refund = await stripe.refunds.create(
        { payment_intent: order.paymentIntentId, amount: itemAmountCents },
        { idempotencyKey: `refund:${orderId}:${itemId}` }
      );

      let deliveryFeeHandling: "refunded" | "not_applicable" = "not_applicable";
      if (singleItemOrder && hasUntransferredDeliveryFee) {
        await stripe.refunds.create(
          {
            payment_intent: order.paymentIntentId,
            amount: Math.round(order.deliveryFee * 100),
          },
          { idempotencyKey: `refund:${orderId}:deliveryFee` }
        );
        order.deliveryFeeTransferred = true; // settled — never transfer to the seller now
        deliveryFeeHandling = "refunded";
      }

      resolution = {
        ...resolution,
        buyerRefundAmount: itemAmountCents / 100,
        sellerAmount: 0,
        platformAmount: 0,
        deliveryFeeHandling,
        stripeRefundId: refund.id,
      };
    } else if (outcome === "buyer_fault") {
      if (!canTransfer) {
        return NextResponse.json(
          { error: "Store isn't Connect-onboarded — can't transfer funds" },
          { status: 400 }
        );
      }

      const sellerCents = Math.round(
        item.price * item.quantity * (1 - (order.commissionRateSnapshot ?? 0) / 100) * 100
      );
      const transfer = await stripe.transfers.create(
        {
          amount: sellerCents,
          currency: "eur",
          destination: store!.stripeAccountId!,
          source_transaction: order.chargeId,
          transfer_group: order._id.toString(),
        },
        { idempotencyKey: `transfer:${orderId}:${itemId}` }
      );

      let deliveryFeeHandling: "kept_by_seller" | "not_applicable" = "not_applicable";
      if (order.deliveryType === "delivery" && order.deliveryFee > 0) {
        deliveryFeeHandling = "kept_by_seller";
        if (hasUntransferredDeliveryFee) {
          const feeTransfer = await stripe.transfers.create(
            {
              amount: Math.round(order.deliveryFee * 100),
              currency: "eur",
              destination: store!.stripeAccountId!,
              source_transaction: order.chargeId,
              transfer_group: order._id.toString(),
            },
            { idempotencyKey: `transfer:${orderId}:deliveryFee` }
          );
          order.deliveryFeeTransferred = true;
          order.deliveryFeeTransferId = feeTransfer.id;
        }
      }

      resolution = {
        ...resolution,
        buyerRefundAmount: 0,
        sellerAmount: sellerCents / 100,
        platformAmount: itemAmountCents / 100 - sellerCents / 100,
        deliveryFeeHandling,
        stripeTransferId: transfer.id,
      };
    } else {
      // split — admin-chosen, delivery fee always stays with the seller
      if (!canTransfer) {
        return NextResponse.json(
          { error: "Store isn't Connect-onboarded — can't transfer funds" },
          { status: 400 }
        );
      }

      const buyerRefundCents = Math.round(itemAmountCents * (buyerPct / 100));
      const sellerCents = Math.round(itemAmountCents * (sellerPct / 100));

      const refund = await stripe.refunds.create(
        { payment_intent: order.paymentIntentId, amount: buyerRefundCents },
        { idempotencyKey: `refund:${orderId}:${itemId}:split` }
      );
      const transfer = await stripe.transfers.create(
        {
          amount: sellerCents,
          currency: "eur",
          destination: store!.stripeAccountId!,
          source_transaction: order.chargeId,
          transfer_group: order._id.toString(),
        },
        { idempotencyKey: `transfer:${orderId}:${itemId}:split` }
      );

      let deliveryFeeHandling: "kept_by_seller" | "not_applicable" = "not_applicable";
      if (order.deliveryType === "delivery" && order.deliveryFee > 0) {
        deliveryFeeHandling = "kept_by_seller";
        if (hasUntransferredDeliveryFee) {
          const feeTransfer = await stripe.transfers.create(
            {
              amount: Math.round(order.deliveryFee * 100),
              currency: "eur",
              destination: store!.stripeAccountId!,
              source_transaction: order.chargeId,
              transfer_group: order._id.toString(),
            },
            { idempotencyKey: `transfer:${orderId}:deliveryFee` }
          );
          order.deliveryFeeTransferred = true;
          order.deliveryFeeTransferId = feeTransfer.id;
        }
      }

      resolution = {
        ...resolution,
        buyerRefundAmount: buyerRefundCents / 100,
        sellerAmount: sellerCents / 100,
        platformAmount: (itemAmountCents - buyerRefundCents - sellerCents) / 100,
        deliveryFeeHandling,
        stripeRefundId: refund.id,
        stripeTransferId: transfer.id,
      };
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Stripe operation failed: ${err?.message || err}` },
      { status: 500 }
    );
  }

  item.resolution = resolution;
  item.fulfillmentStatus = "resolved";

  await order.save();
  await sendDisputeResolvedForOrder(order, item);

  return NextResponse.json({ success: true, resolution });
}
