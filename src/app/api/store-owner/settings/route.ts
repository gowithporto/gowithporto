import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STORE_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fulfillmentPin } = await req.json();

  if (typeof fulfillmentPin !== "string" || !fulfillmentPin.trim()) {
    return NextResponse.json(
      { error: "Enter a PIN" },
      { status: 400 }
    );
  }

  await connectDB();

  const fulfillmentPinHash = await bcrypt.hash(fulfillmentPin.trim(), 10);
  await Store.findByIdAndUpdate(session.user.storeId, { fulfillmentPinHash });

  return NextResponse.json({ success: true });
}
