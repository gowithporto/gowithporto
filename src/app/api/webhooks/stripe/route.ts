import { buildOrderFromStripeSession } from "@/lib/buildOrderFromStripeSession";
import { grantAiCreditsFromSession } from "@/lib/creditAiPurchase";
import { decrementStockForOrder } from "@/lib/decrementStock";
import {
  sendAdminPayoutEmail,
  sendNewOrderAlertForOrder,
  sendOrderConfirmationForOrder,
} from "@/lib/email";
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

  // Shop checkout and AI-credit checkout both run live now, but this one
  // endpoint URL is registered as two separate Stripe webhook destinations
  // (test mode + live mode), each with its own signing secret — try both, so
  // test-mode events (e.g. store-owner Connect testing) still verify too.
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

  if (
    (event.type === "payout.paid" || event.type === "payout.failed") &&
    !event.account // platform's own payout to the founder's bank, not a connected store's payout to its own bank
  ) {
    const payout = event.data.object as Stripe.Payout;

    await sendAdminPayoutEmail({
      payoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      status: event.type === "payout.paid" ? "paid" : "failed",
      arrivalDate: new Date(payout.arrival_date * 1000).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      failureMessage: payout.failure_message || undefined,
    });

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
    await sendNewOrderAlertForOrder(order);
    return NextResponse.json({ received: true, orderId: order._id });
  } catch (err: any) {
    // Duplicate key on stripeSessionId means /api/orders/confirm already created it — fine.
    if (err?.code === 11000) {
      return NextResponse.json({ received: true });
    }
    throw err;
  }
}
