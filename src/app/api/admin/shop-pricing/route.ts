import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getShopMinOrderCents } from "@/lib/shopSettings";
import GlobalConfig from "@/models/GlobalConfig";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const CONFIG_KEY = "SHOP_MIN_ORDER";
const MAX_MIN_ORDER_CENTS = 100000; // €1000 — sanity ceiling

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const minOrderCents = await getShopMinOrderCents();
  return NextResponse.json({ minOrderCents });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { minOrderCents } = await req.json();

  if (
    typeof minOrderCents !== "number" ||
    !Number.isFinite(minOrderCents) ||
    minOrderCents < 0 ||
    minOrderCents > MAX_MIN_ORDER_CENTS
  ) {
    return NextResponse.json(
      {
        error: `Minimum order must be between €0.00 and €${(MAX_MIN_ORDER_CENTS / 100).toFixed(2)}`,
      },
      { status: 400 }
    );
  }

  await connectDB();

  const config = await GlobalConfig.findOneAndUpdate(
    { key: CONFIG_KEY },
    { value: { minOrderCents: Math.round(minOrderCents) } },
    { new: true, upsert: true }
  );

  return NextResponse.json({ minOrderCents: config.value.minOrderCents });
}
