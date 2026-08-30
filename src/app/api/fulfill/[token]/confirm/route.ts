import { confirmItemFulfillment } from "@/lib/confirmFulfillment";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import Order from "@/models/Order";
import Store from "@/models/Store";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const ip = getClientIp(req.headers);
  if (!checkRateLimit(`fulfill-confirm:${ip}:${token}`)) {
    return NextResponse.json(
      { valid: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { pin } = await req.json();
  if (!pin || typeof pin !== "string") {
    return NextResponse.json(
      { valid: false, error: "Incorrect code" },
      { status: 401 }
    );
  }

  await connectDB();

  const order = await Order.findOne({
    items: {
      $elemMatch: {
        fulfillmentToken: token,
        fulfillmentStatus: { $in: ["dispatched", "ready_for_pickup"] },
      },
    },
  });

  const item = order?.items.find((i: any) => i.fulfillmentToken === token);

  if (!order || !item) {
    // Don't leak whether the token ever existed — just say it's no longer valid.
    return NextResponse.json(
      { valid: false, error: "This confirmation link is no longer valid" },
      { status: 200 }
    );
  }

  const store = await Store.findById(order.storeId);

  let pinValid = false;
  try {
    pinValid =
      !!store?.fulfillmentPinHash &&
      (await bcrypt.compare(pin, store.fulfillmentPinHash));
  } catch {
    pinValid = false;
  }

  if (!pinValid) {
    return NextResponse.json(
      { valid: false, error: "Incorrect code" },
      { status: 401 }
    );
  }

  await confirmItemFulfillment(order, item, store);

  await order.save();

  return NextResponse.json({ valid: true, itemTitle: item.title });
}
