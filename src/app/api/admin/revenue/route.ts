import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Store from "@/models/Store";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Orders are counted as revenue once payment has been captured — i.e. any
    // status past "paid" (paid/shipped/delivered/completed), matched
    // case-insensitively since store-owner and admin flows both write
    // lowercase statuses ("paid", "shipped").
    const revenueStatusMatch = {
      $expr: {
        $in: [
          { $toLower: "$status" },
          ["paid", "shipped", "delivered", "completed"],
        ],
      },
    };

    // 1. Total Revenue + platform commission vs store payouts
    const totalRevenueAgg = await Order.aggregate([
      { $match: revenueStatusMatch },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          totalCommission: { $sum: "$platformFeeAmount" },
          totalPayouts: { $sum: "$storeOwnerAmount" },
        },
      },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalCommission = totalRevenueAgg[0]?.totalCommission || 0;
    const totalPayouts = totalRevenueAgg[0]?.totalPayouts || 0;

    // 2. Revenue by Store (incl. commission earned per store)
    const revenueByStore = await Order.aggregate([
      { $match: revenueStatusMatch },
      {
        $group: {
          _id: "$storeId",
          total: { $sum: "$total" },
          commission: { $sum: "$platformFeeAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Populate store names + Stripe Connect onboarding status for these IDs
    const storeIds = revenueByStore.map((item) => item._id);
    const stores = await Store.find({ _id: { $in: storeIds } });

    const revenueByStoreWithDetails = revenueByStore.map((item) => {
        const store = stores.find(s => s._id.toString() === item._id?.toString());
        return {
            storeId: item._id,
            storeName: store?.name || "Unknown Store",
            total: item.total,
            commission: item.commission,
            orders: item.count,
            commissionRate: store?.commissionRate ?? 10,
            stripeOnboardingComplete: store?.stripeOnboardingComplete ?? false,
        };
    });

    // 3. Connected-store status across ALL stores (not just ones with revenue)
    const allStores = await Store.find({}).select(
      "name active stripeAccountId stripeOnboardingComplete commissionRate"
    );
    const connectStatus = allStores.map((s) => ({
      storeId: s._id,
      storeName: s.name,
      active: s.active,
      commissionRate: s.commissionRate,
      hasStripeAccount: !!s.stripeAccountId,
      stripeOnboardingComplete: s.stripeOnboardingComplete,
    }));

    // 4. Daily Revenue (Last 60 days — wide enough for the dashboard to
    // derive both the current and previous 30-day windows for MoM deltas)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          ...revenueStatusMatch,
          createdAt: { $gte: sixtyDaysAgo },
        },
      },
      {
        $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      totalRevenue,
      totalCommission,
      totalPayouts,
      revenueByStore: revenueByStoreWithDetails,
      dailyRevenue,
      connectStatus,
    });
  } catch (error) {
    console.error("Revenue API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}
