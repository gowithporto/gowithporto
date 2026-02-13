import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getData() {
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };
  const baseUrl = process.env.NEXTAUTH_URL;

  const [orders, credits, aiHistory] = await Promise.all([
    fetch(`${baseUrl}/api/orders`, { headers, cache: "no-store" }).then((r) =>
      r.ok ? r.json() : [],
    ),
    fetch(`${baseUrl}/api/user/credits`, { headers, cache: "no-store" }).then(
      (r) => (r.ok ? r.json() : { credits: 0 }),
    ),
    fetch(`${baseUrl}/api/user/ai-history`, {
      headers,
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : [])),
  ]);

  return { orders, credits: credits.credits, aiHistory };
}

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { orders, credits, aiHistory } = await getData();

  const recentOrders = orders.slice(0, 3);
  const recentAi = aiHistory.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-medium opacity-90">Available Credits</h3>
          <p className="text-4xl font-bold mt-2">{credits}</p>
          <Link
            href="/dashboard/transactions"
            className="text-sm mt-4 inline-block opacity-80 hover:opacity-100 underline"
          >
            View Transactions
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">
            {orders.length}
          </p>
          <Link
            href="/dashboard/orders"
            className="text-sm mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View All Orders
          </Link>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">
            AI Plans Generated
          </h3>
          <p className="text-4xl font-bold mt-2 text-gray-900">
            {aiHistory.length}
          </p>
          <Link
            href="/dashboard/ai-history"
            className="text-sm mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View AI History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 bg-gray-50 p-6 rounded-lg">
              No recent orders.
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div
                  key={order._id}
                  className="border p-4 rounded-lg bg-white shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{order.total.toFixed(2)}</p>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link
                href="/dashboard/orders"
                className="block text-center text-sm text-blue-600 hover:underline mt-4"
              >
                View All Orders
              </Link>
            </div>
          )}
        </section>

        {/* Recent AI Activity */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent AI Activity</h2>
          {recentAi.length === 0 ? (
            <p className="text-gray-500 bg-gray-50 p-6 rounded-lg">
              No AI activity found.
            </p>
          ) : (
            <div className="space-y-4">
              {recentAi.map((item: any) => (
                <div
                  key={item._id}
                  className="border p-4 rounded-lg bg-white shadow-sm"
                >
                  <p className="text-sm font-medium truncate">
                    {JSON.stringify(item.prompt).slice(0, 50)}...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              <Link
                href="/dashboard/ai-history"
                className="block text-center text-sm text-blue-600 hover:underline mt-4"
              >
                View All History
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
