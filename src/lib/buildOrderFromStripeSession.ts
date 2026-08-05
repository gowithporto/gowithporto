import Product from "@/models/Product";
import Store from "@/models/Store";
import Stripe from "stripe";

export async function buildOrderFromStripeSession(
  session: Stripe.Checkout.Session
) {
  const address = session.metadata?.address
    ? JSON.parse(session.metadata.address)
    : null;

  const productIds = session.metadata?.productIds?.split(",") || [];

  const products = await Product.find({ _id: { $in: productIds } });
  const imageByProductId = new Map(
    products.map((p) => [p._id.toString(), p.images?.[0]])
  );

  const lineItems = session.line_items?.data || [];

  const items = lineItems
    .filter((li) => li.description !== "Delivery Fee")
    .map((li, index) => ({
      productId: productIds[index] || "",
      title: li.description,
      price: li.price?.unit_amount ? li.price.unit_amount / 100 : 0,
      quantity: li.quantity || 1,
      image: imageByProductId.get(productIds[index]),
    }));

  const total = session.amount_total != null ? session.amount_total / 100 : 0;

  const paymentIntent =
    typeof session.payment_intent === "object" ? session.payment_intent : null;
  const paymentMethod =
    paymentIntent && typeof paymentIntent.payment_method === "object"
      ? paymentIntent.payment_method
      : null;
  const card = paymentMethod?.card;

  const store = session.metadata?.storeId
    ? await Store.findById(session.metadata.storeId)
    : null;

  const canSplit = store?.stripeAccountId && store?.stripeOnboardingComplete;
  const commissionRate = store?.commissionRate ?? 10;
  const platformFeeAmount = canSplit
    ? Math.round(total * (commissionRate / 100) * 100) / 100
    : total;
  const storeOwnerAmount = canSplit ? total - platformFeeAmount : 0;

  return {
    userEmail: session.customer_details?.email,
    items,
    total,
    platformFeeAmount,
    storeOwnerAmount,
    storeStripeAccountId: canSplit ? store!.stripeAccountId : undefined,
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
