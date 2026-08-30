import { sendAdminDisputeAlertForOrder } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// Runs once daily via Vercel Cron (see vercel.json) — Vercel signs its own
// cron requests with this header once CRON_SECRET is set in the project's
// env vars. Detection granularity is "within ~24-48h" of the threshold, not
// exact, since this only runs once a day (Vercel Hobby plan limit).
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const cutoff = new Date(Date.now() - STALE_THRESHOLD_MS);

  const orders = await Order.find({
    "items.fulfillmentStatus": { $in: ["dispatched", "ready_for_pickup"] },
    "items.dispatchedAt": { $lte: cutoff },
  });

  let alertsSent = 0;

  for (const order of orders) {
    for (const item of order.items) {
      const isStale =
        ["dispatched", "ready_for_pickup"].includes(item.fulfillmentStatus) &&
        item.dispatchedAt &&
        item.dispatchedAt.getTime() <= cutoff.getTime();

      if (!isStale || item.staleAlertSentAt) continue;

      item.staleAlertSentAt = new Date();
      await sendAdminDisputeAlertForOrder(order, item, "timeout");
      alertsSent += 1;
    }

    await order.save();
  }

  return NextResponse.json({ checked: orders.length, alertsSent });
}
