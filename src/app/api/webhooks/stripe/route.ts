import { buildOrderFromStripeSession } from "@/lib/buildOrderFromStripeSession";
import { sendOrderConfirmationForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

  const existing = await Order.findOne({
    stripeSessionId: sessionSummary.id,
  });

  if (existing) {
    return NextResponse.json({ received: true, orderId: existing._id });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionSummary.id, {
    expand: ["line_items", "payment_intent.payment_method"],
  });

  const orderData = await buildOrderFromStripeSession(session);

  try {
    const order = await Order.create(orderData);
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
