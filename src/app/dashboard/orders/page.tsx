import { ShoppingBagIcon, TruckIcon } from "@heroicons/react/24/outline";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  pending: "bg-gray-100 text-gray-700",
};

async function getOrders() {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#173d5c]">My Orders</h1>

      {orders.length === 0 && (
        <p className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          No orders yet.
        </p>
      )}

      {orders.map((order: any) => (
        <div
          key={order._id}
          className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#2c6e9b]/10">
                <ShoppingBagIcon className="h-5 w-5 text-[#2c6e9b]" />
              </div>
              <div>
                <p className="font-semibold text-[#173d5c]">
                  Order #{order._id.slice(-6)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="font-bold text-lg text-[#173d5c]">
              €{order.total.toFixed(2)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status.toUpperCase()}
            </span>
            {order.address ? (
              <span className="rounded-full bg-[#2c6e9b]/10 px-2.5 py-1 text-xs font-medium text-[#2c6e9b]">
                DELIVERY
              </span>
            ) : (
              <span className="rounded-full bg-[#eab657]/15 px-2.5 py-1 text-xs font-medium text-[#b8863a]">
                PICKUP
              </span>
            )}
          </div>

          {order.address ? (
            <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              <TruckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2c6e9b]" />
              <p>
                <span className="font-medium">Shipping to </span>
                {order.address.name}, {order.address.street},{" "}
                {order.address.city}, {order.address.postalCode}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 p-3 text-sm italic text-gray-500">
              Pickup from store location
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--text)]">
              Items
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              {order.items.map((i: any, idx: number) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    <span className="font-medium">{i.title}</span> ×{" "}
                    {i.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
