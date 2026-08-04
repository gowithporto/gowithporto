import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

  if (!accountId) {
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
    await store.save();
  }

  const baseUrl = process.env.NEXTAUTH_URL;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/store-owner?connect=refresh`,
    return_url: `${baseUrl}/store-owner?connect=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
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

  return NextResponse.json({
    connected: !!store.stripeAccountId,
    onboardingComplete: store.stripeOnboardingComplete,
    commissionRate: store.commissionRate,
  });
}
