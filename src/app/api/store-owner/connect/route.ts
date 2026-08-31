import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { isStaleStripeAccountError } from "@/lib/stripeErrors";
import Store from "@/models/Store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Connect onboarding runs on the live key even before the rest of the shop
// money path does — store owners need to complete real (not test-mode) bank
// onboarding well ahead of the checkout/payout cutover, since onboarding is
// the slow, external-dependency step.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!);

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const store = await Store.findById(session.user.storeId);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  let accountId = store.stripeAccountId;

  const createFreshAccount = async () => {
    const account = await stripe.accounts.create({
      type: "express",
      country: "PT",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    accountId = account.id;
    store.stripeAccountId = accountId;
    store.stripeOnboardingComplete = false;
    await store.save();
  };

  const baseUrl = process.env.NEXTAUTH_URL;

  try {
    if (!accountId) {
      await createFreshAccount();
    }

    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/store-owner?connect=refresh`,
        return_url: `${baseUrl}/store-owner?connect=success`,
        type: "account_onboarding",
      });
    } catch (err: any) {
      // A stored account id from before the live-key cutover (or any other
      // reason Stripe no longer recognizes it) — self-heal by starting a
      // fresh account rather than leaving the store owner permanently stuck.
      if (!isStaleStripeAccountError(err)) throw err;

      await createFreshAccount();
      accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/store-owner?connect=refresh`,
        return_url: `${baseUrl}/store-owner?connect=success`,
        type: "account_onboarding",
      });
    }

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("Stripe Connect onboarding failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to start onboarding" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const store = await Store.findById(session.user.storeId);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // The `account.updated` webhook is the fast path for picking up onboarding
  // completion, but it depends on the Stripe webhook endpoint being scoped to
  // "events on connected accounts" (a separate Dashboard setting from the
  // regular checkout webhook). Don't rely on that alone — re-check with
  // Stripe directly whenever we haven't seen it flip yet, so a misconfigured
  // or missing Connect webhook can't permanently strand a store as "not
  // connected" even though Stripe already approved them.
  if (store.stripeAccountId && !store.stripeOnboardingComplete) {
    try {
      const account = await stripe.accounts.retrieve(store.stripeAccountId);
      const onboardingComplete = !!(account.charges_enabled && account.payouts_enabled);
      if (onboardingComplete !== store.stripeOnboardingComplete) {
        store.stripeOnboardingComplete = onboardingComplete;
        await store.save();
      }
    } catch (err: any) {
      if (isStaleStripeAccountError(err)) {
        // Stale account id (e.g. from before the live-key cutover) — clear it
        // so the store shows as "not connected" instead of erroring, and the
        // next onboarding attempt starts a fresh account.
        store.stripeAccountId = undefined;
        store.stripeOnboardingComplete = false;
        await store.save();
      } else {
        console.error("Stripe Connect status check failed:", err);
      }
    }
  }

  return NextResponse.json({
    connected: !!store.stripeAccountId,
    onboardingComplete: store.stripeOnboardingComplete,
    commissionRate: store.commissionRate,
  });
}
