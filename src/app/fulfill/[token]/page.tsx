import FulfillForm from "@/components/fulfill/FulfillForm";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Store from "@/models/Store";

export default async function FulfillPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-xl font-semibold text-[#1d3d5c]">
            This confirmation link is no longer valid
          </h1>
          <p className="mt-2 text-sm text-black/50">
            It may have already been used, or this item isn&apos;t currently
            awaiting confirmation.
          </p>
        </div>
      </div>
    );
  }

  const store = await Store.findById(order.storeId).select("name location");
  const isPickup = order.deliveryType === "pickup";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-[#1d3d5c]">
          {isPickup ? "Confirm Pickup" : "Confirm Delivery"}
        </h1>

        <div className="mt-3 rounded-xl bg-[#FAF8F5] p-3 text-sm text-black/70">
          <p className="font-medium">
            {item.title} × {item.quantity}
          </p>
          {store?.name && (
            <p className="mt-0.5 text-black/40">
              {store.name}
              {store.location ? ` — ${store.location}` : ""}
            </p>
          )}
        </div>

        <FulfillForm token={token} isPickup={isPickup} />
      </div>
    </div>
  );
}
