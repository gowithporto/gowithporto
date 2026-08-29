import { buildOrderFromStripeSession } from "@/lib/buildOrderFromStripeSession";
import { grantAiCreditsFromSession } from "@/lib/creditAiPurchase";
import { decrementStockForOrder } from "@/lib/decrementStock";
import { sendOrderConfirmationForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeTest = new Stripe(process.env.STRIPE_SECRET_KEY!);
const stripeLive = process.env.STRIPE_SECRET_KEY_LIVE
  ? new Stripe(process.env.STRIPE_SECRET_KEY_LIVE)
  : null;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Shop checkout (test mode) and AI-credit checkout (live mode) currently share
  // this one endpoint URL but are registered as separate Stripe webhook
  // destinations, each with its own signing secret — try both.
  let event: Stripe.Event;
  let stripe = stripeTest;

  try {
    event = stripeTest.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (testErr) {
    if (!stripeLive || !process.env.STRIPE_WEBHOOK_SECRET_LIVE) {
      console.error("Stripe webhook signature verification failed:", testErr);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    try {
      event = stripeLive.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET_LIVE
      );
      stripe = stripeLive;
    } catch (liveErr) {
      console.error("Stripe webhook signature verification failed:", liveErr);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    await connectDB();

    await Store.findOneAndUpdate(
      { stripeAccountId: account.id },
      {
        stripeOnboardingComplete: !!(
          account.charges_enabled && account.payouts_enabled
        ),
      }
    );

    return NextResponse.json({ received: true });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const sessionSummary = event.data.object as Stripe.Checkout.Session;

  if (sessionSummary.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  await connectDB();

  if (sessionSummary.metadata?.type === "AI_CREDITS") {
    const fullSession = await stripe.checkout.sessions.retrieve(sessionSummary.id, {
      expand: ["payment_intent.payment_method"],
    });
    await grantAiCreditsFromSession(fullSession);
    return NextResponse.json({ received: true });
  }

  if (event.livemode) {
    // Shop checkout only ever runs in test mode today — a live-mode event
    // reaching this branch means something is misconfigured. Don't build an
    // Order off it.
    console.error("Unexpected live-mode event for shop order path:", event.id);
    return NextResponse.json({ received: true });
  }

  const existing = await Order.findOne({
    stripeSessionId: sessionSummary.id,
  });

  if (existing) {
    return NextResponse.json({ received: true, orderId: existing._id });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionSummary.id, {
    expand: [
      "line_items",
      "payment_intent.payment_method",
      "payment_intent.latest_charge",
    ],
  });

  const orderData = await buildOrderFromStripeSession(session);

  try {
    const order = await Order.create(orderData);
    await decrementStockForOrder(order.items);
    await sendOrderConfirmationForOrder(order);
    return NextResponse.json({ received: true, orderId: order._id });
  } catch (err: any) {
    // Duplicate key on stripeSessionId means /api/orders/confirm already created it — fine.
    if (err?.code === 11000) {
      return NextResponse.json({ received: true });
    }
    throw err;
  }
}
