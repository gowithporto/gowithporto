import { authOptions } from "@/lib/auth";
import { grantAiCreditsFromSession } from "@/lib/creditAiPurchase";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    await connectDB();

    // 1. Verify the session with Stripe to get amount details
    console.log("Retrieving Stripe session:", sessionId);
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.payment_method"],
    });
    console.log("Stripe session retrieved. Status:", stripeSession.payment_status);

    if (stripeSession.payment_status !== "paid") {
      console.warn("Payment not paid for session:", sessionId);
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const boundEmail = stripeSession.metadata?.userEmail || stripeSession.client_reference_id;
    if (boundEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    await grantAiCreditsFromSession(stripeSession);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error finalizing credits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
