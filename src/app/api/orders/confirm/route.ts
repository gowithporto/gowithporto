import { buildOrderFromStripeSession } from "@/lib/buildOrderFromStripeSession";
import { sendOrderConfirmationForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  await connectDB();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent.payment_method"],
  });

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 400 }
    );
  }

  // Create order — or return the one the webhook already created for this session
  const existing = await Order.findOne({ stripeSessionId: session.id });

  if (existing) {
    return NextResponse.json({ success: true, orderId: existing._id });
  }

  const orderData = await buildOrderFromStripeSession(session);

  try {
    const order = await Order.create(orderData);
    await sendOrderConfirmationForOrder(order);
    return NextResponse.json({ success: true, orderId: order._id });
  } catch (err: any) {
    // Duplicate key on stripeSessionId means the webhook won the race — fine, fetch it.
    if (err?.code === 11000) {
      const order = await Order.findOne({ stripeSessionId: session.id });
      return NextResponse.json({ success: true, orderId: order?._id });
    }
    throw err;
  }
}
