import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const store = await Store.findById(id).select(
    "-passwordHash -fulfillmentPinHash"
  );
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

// Only these fields are admin-editable here — never accept storeCode,
// passwordHash, stripeAccountId, or role through this route.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const {
    name,
    location,
    email,
    phone,
    deliveryFee,
    deliveryZoneFees,
    googleMapsLink,
    commissionRate,
    fulfillmentPin,
  } = body;

  if (!name || !location) {
    return NextResponse.json(
      { error: "Name and location are required" },
      { status: 400 }
    );
  }

  if (
    typeof commissionRate !== "number" ||
    commissionRate < 0 ||
    commissionRate > 100
  ) {
    return NextResponse.json(
      { error: "Commission rate must be between 0 and 100" },
      { status: 400 }
    );
  }

  if (typeof deliveryFee !== "number" || deliveryFee < 0) {
    return NextResponse.json(
      { error: "Delivery fee must be 0 or more" },
      { status: 400 }
    );
  }

  const zoneKeys = ["porto", "innerRing", "outerRing"] as const;
  if (deliveryZoneFees) {
    for (const key of zoneKeys) {
      const value = deliveryZoneFees[key];
      if (value !== undefined && value !== null && (typeof value !== "number" || value < 0)) {
        return NextResponse.json(
          { error: `Zone fee "${key}" must be 0 or more` },
          { status: 400 }
        );
      }
    }
  }

  await connectDB();

  const update: Record<string, unknown> = {
    name,
    location,
    email: email || undefined,
    phone: phone || undefined,
    deliveryFee,
    deliveryZoneFees: deliveryZoneFees || undefined,
    googleMapsLink: googleMapsLink || undefined,
    commissionRate,
  };

  if (typeof fulfillmentPin === "string" && fulfillmentPin.trim()) {
    update.fulfillmentPinHash = await bcrypt.hash(fulfillmentPin.trim(), 10);
  }

  const store = await Store.findByIdAndUpdate(id, update, {
    new: true,
  }).select("-passwordHash -fulfillmentPinHash");

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

// Lightweight active/inactive toggle, kept separate from PUT so the admin
// stores list can flip status with one click without submitting the full
// edit form. Deactivating also blocks that store owner's login (see
// lib/auth.ts) and hides its products from the shop (see api/products and
// lib/products.ts) — a documents/compliance suspension, not just a label.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { active } = await req.json();

  if (typeof active !== "boolean") {
    return NextResponse.json(
      { error: "active must be a boolean" },
      { status: 400 }
    );
  }

  await connectDB();

  const store = await Store.findByIdAndUpdate(
    id,
    { active },
    { new: true }
  ).select("-passwordHash -fulfillmentPinHash");

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}
