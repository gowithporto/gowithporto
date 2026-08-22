import { AI_CREDITS_PER_PURCHASE } from "@/lib/aiCredits";
import { sendCreditReceiptEmail } from "@/lib/email";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import type Stripe from "stripe";

export async function grantAiCreditsFromSession(
  session: Stripe.Checkout.Session
): Promise<{ granted: boolean }> {
  const existing = await Transaction.findOne({ stripeSessionId: session.id });
  if (existing) {
    return { granted: false };
  }

  const userEmail = session.metadata?.userEmail || session.client_reference_id;
  if (!userEmail) {
    console.error("AI credits session has no user identity:", session.id);
    return { granted: false };
  }

  const creditsToAdd = Number(session.metadata?.credits) || AI_CREDITS_PER_PURCHASE;

  const paymentIntent =
    typeof session.payment_intent === "object" ? session.payment_intent : null;
  const paymentMethod =
    paymentIntent && typeof paymentIntent.payment_method === "object"
      ? paymentIntent.payment_method
      : null;
  const card = paymentMethod?.card;

  try {
    await Transaction.create({
      userEmail,
      stripeSessionId: session.id,
      amount: session.amount_total ?? 500,
      currency: session.currency ?? "eur",
      creditsAdded: creditsToAdd,
      cardBrand: card?.brand,
      cardLast4: card?.last4,
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      // Lost the race to the webhook/fallback route — credits already recorded.
      return { granted: false };
    }
    throw err;
  }

  // Only increment credits once the Transaction insert has won the race.
  await User.updateOne({ email: userEmail }, { $inc: { credits: creditsToAdd } });

  const user = await User.findOne({ email: userEmail }).select("name");
  await sendCreditReceiptEmail(userEmail, {
    recipientName: user?.name || userEmail.split("@")[0],
    creditsAdded: creditsToAdd,
    amount: (session.amount_total ?? 500) / 100,
    currency: session.currency ?? "eur",
    date: new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  return { granted: true };
}
