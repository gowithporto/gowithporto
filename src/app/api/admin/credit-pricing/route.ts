import { authOptions } from "@/lib/auth";
import { getAiCreditsPricing } from "@/lib/aiCredits";
import { connectDB } from "@/lib/mongodb";
import GlobalConfig from "@/models/GlobalConfig";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const CONFIG_KEY = "CREDIT_PRICING";
const MIN_PRICE_CENTS = 50; // €0.50 — Stripe's minimum charge amount for EUR card payments
const MAX_PRICE_CENTS = 1000; // €10.00
const MIN_CREDITS = 1;
const MAX_CREDITS = 100;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pricing = await getAiCreditsPricing();

  return NextResponse.json(pricing);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceCents, creditsPerPurchase } = await req.json();

  if (
    typeof priceCents !== "number" ||
    !Number.isFinite(priceCents) ||
    priceCents < MIN_PRICE_CENTS ||
    priceCents > MAX_PRICE_CENTS
  ) {
    return NextResponse.json(
      {
        error: `Price must be between €${(MIN_PRICE_CENTS / 100).toFixed(2)} and €${(MAX_PRICE_CENTS / 100).toFixed(2)} — Stripe rejects card charges below €${(MIN_PRICE_CENTS / 100).toFixed(2)}`,
      },
      { status: 400 }
    );
  }

  if (
    typeof creditsPerPurchase !== "number" ||
    !Number.isInteger(creditsPerPurchase) ||
    creditsPerPurchase < MIN_CREDITS ||
    creditsPerPurchase > MAX_CREDITS
  ) {
    return NextResponse.json(
      { error: `Credits per purchase must be a whole number between ${MIN_CREDITS} and ${MAX_CREDITS}` },
      { status: 400 }
    );
  }

  await connectDB();

  const config = await GlobalConfig.findOneAndUpdate(
    { key: CONFIG_KEY },
    { value: { priceCents: Math.round(priceCents), creditsPerPurchase } },
    { new: true, upsert: true }
  );

  return NextResponse.json({
    priceCents: config.value.priceCents,
    creditsPerPurchase: config.value.creditsPerPurchase,
  });
}
