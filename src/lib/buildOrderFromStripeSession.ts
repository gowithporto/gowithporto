import { generateFulfillmentToken } from "@/lib/tokens";
import Product from "@/models/Product";
import Store from "@/models/Store";
import mongoose from "mongoose";
import Stripe from "stripe";

export async function buildOrderFromStripeSession(
  session: Stripe.Checkout.Session
) {
  const address = session.metadata?.address
    ? JSON.parse(session.metadata.address)
    : null;

  const productIds = session.metadata?.productIds?.split(",") || [];
  const variantIds = session.metadata?.variantIds?.split(",") || [];

  const products = await Product.find({ _id: { $in: productIds } });
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  const lineItems = session.line_items?.data || [];

  const items = lineItems
    .filter((li) => li.description !== "Delivery Fee")
    .map((li, index) => {
      const productId = productIds[index] || "";
      const variantId = variantIds[index] || "";
      const product = productById.get(productId);
      const variant = variantId
        ? product?.variants?.find((v: any) => v._id.toString() === variantId)
        : null;

      return {
        productId,
        variantId: variantId || undefined,
        variantName: variant?.name,
        title: li.description,
        price: li.price?.unit_amount ? li.price.unit_amount / 100 : 0,
        quantity: li.quantity || 1,
        image: variant?.image || product?.images?.[0],
        fulfillmentToken: generateFulfillmentToken(),
        fulfillmentStatus: "pending" as const,
      };
    });

  const total = session.amount_total != null ? session.amount_total / 100 : 0;

  const paymentIntent =
    typeof session.payment_intent === "object" ? session.payment_intent : null;
  const paymentMethod =
    paymentIntent && typeof paymentIntent.payment_method === "object"
      ? paymentIntent.payment_method
      : null;
  const card = paymentMethod?.card;

  const paymentIntentId = paymentIntent?.id;
  const chargeId =
    typeof paymentIntent?.latest_charge === "string"
      ? paymentIntent.latest_charge
      : paymentIntent?.latest_charge?.id;

  const store = session.metadata?.storeId
    ? await Store.findById(session.metadata.storeId)
    : null;

  const commissionRate = store?.commissionRate ?? 10;

  // Commission is taken from product sales only — the delivery fee stays
  // 100% with the store owner, since it's their shipping cost. These two
  // fields are informational estimates for display; the actual Stripe
  // transfer/refund amounts are recomputed per item at confirmation/
  // resolution time from `price * quantity * (1 - commissionRateSnapshot/100)`.
  const productsSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFeeAmount = Math.round(productsSubtotal * (commissionRate / 100) * 100) / 100;
  const storeOwnerAmount = Math.round((productsSubtotal - platformFeeAmount) * 100) / 100;

  return {
    _id: session.metadata?.orderId
      ? new mongoose.Types.ObjectId(session.metadata.orderId)
      : undefined,
    userEmail: session.customer_details?.email,
    items,
    total,
    paymentIntentId,
    chargeId,
    commissionRateSnapshot: commissionRate,
    platformFeeAmount,
    storeOwnerAmount,
    storeStripeAccountId: store?.stripeAccountId,
    status: "paid",
    deliveryType: session.metadata?.deliveryType,
    deliveryFee: Number(session.metadata?.deliveryFee || 0),
    address: address || undefined,
    storeId: session.metadata?.storeId,
    stripeSessionId: session.id,
    cardBrand: card?.brand,
    cardLast4: card?.last4,
  };
}
