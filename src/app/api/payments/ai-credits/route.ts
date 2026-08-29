import { getAiCreditsPricing } from "@/lib/aiCredits";
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

  const { priceCents, creditsPerPurchase } = await getAiCreditsPricing();

  try {
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
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/ai/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/ai/cancel`,
      metadata: {
        type: "AI_CREDITS",
        userEmail: session.user.email,
        credits: String(creditsPerPurchase),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    if (err?.code === "amount_too_small") {
      console.error("AI credit price is below Stripe's minimum:", priceCents);
      return NextResponse.json(
        { error: "Credit price is currently misconfigured. Please try again shortly." },
        { status: 500 }
      );
    }
    throw err;
  }
}
