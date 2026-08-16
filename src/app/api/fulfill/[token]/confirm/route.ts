import { connectDB } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import Order from "@/models/Order";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`fulfill-confirm:${ip}:${token}`)) {
    return NextResponse.json(
      { valid: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { pin } = await req.json();
  if (!pin || typeof pin !== "string") {
    return NextResponse.json(
      { valid: false, error: "Incorrect code" },
      { status: 401 }
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
    // Don't leak whether the token ever existed — just say it's no longer valid.
    return NextResponse.json(
      { valid: false, error: "This confirmation link is no longer valid" },
      { status: 200 }
    );
  }

  const store = await Store.findById(order.storeId);

  let pinValid = false;
  try {
    pinValid =
      !!store?.fulfillmentPinHash &&
      (await bcrypt.compare(pin, store.fulfillmentPinHash));
  } catch {
    pinValid = false;
  }

  if (!pinValid) {
    return NextResponse.json(
      { valid: false, error: "Incorrect code" },
      { status: 401 }
    );
  }

  const isPickup = order.deliveryType === "pickup";
  item.fulfillmentStatus = isPickup ? "picked_up" : "delivered";
  item.confirmedAt = new Date();

  const canTransfer = !!(store?.stripeAccountId && store?.stripeOnboardingComplete);
  const amountCents = Math.round(
    item.price * item.quantity * (1 - (order.commissionRateSnapshot ?? 0) / 100) * 100
  );

  if (canTransfer) {
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: amountCents,
          currency: "eur",
          destination: store!.stripeAccountId!,
          source_transaction: order.chargeId,
          transfer_group: order._id.toString(),
        },
        { idempotencyKey: `transfer:${order._id}:${item._id}` }
      );
      item.transferId = transfer.id;
      item.transferAmount = amountCents / 100;
      item.transferredAt = new Date();
    } catch (err: any) {
      item.transferPending = true;
      item.transferError = String(err?.message || err);
    }
  } else {
    item.transferPending = true;
    item.transferError = "Store not Connect-onboarded yet";
  }

  if (
    order.deliveryType === "delivery" &&
    order.deliveryFee > 0 &&
    !order.deliveryFeeTransferred &&
    canTransfer
  ) {
    try {
      const feeTransfer = await stripe.transfers.create(
        {
          amount: Math.round(order.deliveryFee * 100),
          currency: "eur",
          destination: store!.stripeAccountId!,
          source_transaction: order.chargeId,
          transfer_group: order._id.toString(),
        },
        { idempotencyKey: `transfer:${order._id}:deliveryFee` }
      );
      order.deliveryFeeTransferred = true;
      order.deliveryFeeTransferId = feeTransfer.id;
    } catch (err: any) {
      order.deliveryFeeTransferError = String(err?.message || err);
    }
  }

  await order.save();

  return NextResponse.json({ valid: true, itemTitle: item.title });
}
