import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    const paymentIntent =
      typeof stripeSession.payment_intent === "object"
        ? stripeSession.payment_intent
        : null;
    const paymentMethod =
      paymentIntent && typeof paymentIntent.payment_method === "object"
        ? paymentIntent.payment_method
        : null;
    const card = paymentMethod?.card;
    
    if (stripeSession.payment_status !== "paid") {
      console.warn("Payment not paid for session:", sessionId);
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // 2. Check if transaction already exists to avoid duplicates
    const existing = await Transaction.findOne({ stripeSessionId: sessionId });
    if (existing) {
       return NextResponse.json({ success: true, message: "Already processed" });
    }

    const creditsToAdd = 5; // Matches the increment logic

    // 3. Update user credits
    await User.updateOne(
      { email: session.user.email },
      { $inc: { credits: creditsToAdd } }
    );

    // 4. Create Transaction record
    const newTransaction = await Transaction.create({
      userEmail: session.user.email,
      stripeSessionId: sessionId,
      amount: stripeSession.amount_total ?? 500,
      currency: stripeSession.currency ?? "eur",
      creditsAdded: creditsToAdd,
      cardBrand: card?.brand,
      cardLast4: card?.last4,
    });
    console.log("Transaction created successfully:", newTransaction._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error finalizing credits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
