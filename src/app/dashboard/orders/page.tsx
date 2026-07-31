import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import OrdersList from "@/components/dashboard/OrdersList";

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
      <OrdersList orders={orders} />
    </div>
  );
}
