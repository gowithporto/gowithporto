import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Sends the store owner to Stripe's own hosted Express dashboard, where
// they can see real payout status/history/arrival dates straight from
// Stripe — no need to duplicate that UI ourselves.
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const store = await Store.findById(session.user.storeId);

  if (!store?.stripeAccountId) {
    return NextResponse.json(
      { error: "Set up payouts first" },
      { status: 400 },
    );
  }

  const loginLink = await stripe.accounts.createLoginLink(
    store.stripeAccountId,
  );

  return NextResponse.json({ url: loginLink.url });
}
