import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AIResponse from "@/models/AIResponse";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [users, orderStats, txStats, aiStats] = await Promise.all([
      User.find(
        {},
        "name email role image credits freeUsed createdAt updatedAt",
      )
        .sort({ createdAt: -1 })
        .lean(),
      Order.aggregate([
        {
          $group: {
            _id: "$userEmail",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $group: {
            _id: "$userEmail",
            count: { $sum: 1 },
            total: { $sum: "$amount" },
          },
        },
      ]),
      AIResponse.aggregate([
        { $group: { _id: "$userEmail", count: { $sum: 1 } } },
      ]),
    ]);

    const orderMap = new Map(orderStats.map((o) => [o._id, o]));
    const txMap = new Map(txStats.map((t) => [t._id, t]));
    const aiMap = new Map(aiStats.map((a) => [a._id, a]));

    const enriched = users.map((u) => ({
      ...u,
      ordersCount: orderMap.get(u.email)?.count || 0,
      totalSpent: orderMap.get(u.email)?.total || 0,
      topUpsCount: txMap.get(u.email)?.count || 0,
      totalTopUp: (txMap.get(u.email)?.total || 0) / 100,
      aiPlansCount: aiMap.get(u.email)?.count || 0,
    }));

    return NextResponse.json(enriched, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
