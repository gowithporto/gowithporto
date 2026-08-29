import { AI_CREDITS_PER_PURCHASE, AI_CREDITS_PRICE_CENTS } from "@/lib/aiCredits";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!);

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: session.user.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "AI Travel Planner Credits",
          },
          unit_amount: AI_CREDITS_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/ai/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/ai/cancel`,
    metadata: {
      type: "AI_CREDITS",
      userEmail: session.user.email,
      credits: String(AI_CREDITS_PER_PURCHASE),
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
