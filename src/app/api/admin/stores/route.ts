import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET: List all stores
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const stores = await Store.find({})
      .select("-passwordHash -fulfillmentPinHash")
      .sort({ createdAt: -1 });

    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

// POST: Create a new store
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, storeCode, password, slug, location, deliveryFee } = body;

    // Basic validation
    if (!name || !storeCode || !password || !slug || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check availability
    const existing = await Store.findOne({
      $or: [{ storeCode }, { slug }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Store code or slug already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStore = await Store.create({
      name,
      slug,
      location,
      storeCode,
      passwordHash: hashedPassword,
      deliveryFee: deliveryFee || 0,
      active: true,
      role: "STORE_OWNER",
    });

    return NextResponse.json(newStore, { status: 201 });
  } catch (error: any) {
    console.error("Create Store Error:", error);
    return NextResponse.json(
        { error: error?.message || "Failed to create store" },
        { status: 500 }
      );
  }
}
