import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Store from "@/models/Store";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { items, deliveryType, address } = await req.json();

  await connectDB();

  // Fetch products
  const products = await Product.find({
    _id: { $in: items.map((i: any) => i.productId) },
  });
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  const storeId = products[0].storeId;
  const store = await Store.findById(storeId);

  // Resolve each cart line (not each unique product) — a cart can hold
  // several variants of the same product, and each is its own line item.
  const resolveLine = (item: any) => {
    const product = productById.get(item.productId);
    const variant = item.variantId
      ? product?.variants?.find(
          (v: any) => v._id.toString() === item.variantId
        )
      : null;
    const price = variant?.price ?? product.price;
    const name = variant ? `${product.title} — ${variant.name}` : product.title;
    return { price, name };
  };

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item: any) => {
      const { price, name } = resolveLine(item);

      return {
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(price * 100),
          product_data: {
            name,
          },
        },
      };
    }
  );

  // Platform commission is taken from product sales only — the store owner
  // keeps 100% of the delivery fee, since that's their shipping cost.
  const productsSubtotalCents = items.reduce((sum: number, item: any) => {
    const { price } = resolveLine(item);
    return sum + Math.round(price * 100) * item.quantity;
  }, 0);

  const canSplit = store.stripeAccountId && store.stripeOnboardingComplete;
  const applicationFeeAmount = canSplit
    ? Math.round(productsSubtotalCents * (store.commissionRate / 100))
    : undefined;

  let deliveryFee = 0;

  if (deliveryType === "delivery") {
    deliveryFee = Number(store.deliveryFee || 0);

    if (deliveryFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(deliveryFee * 100),
          product_data: {
            name: "Delivery Fee",
          },
        },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,

    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,

    metadata: {
      deliveryType,
      deliveryFee,
      address: address ? JSON.stringify(address) : "",
      productIds: items.map((i: any) => i.productId).join(","),
      variantIds: items.map((i: any) => i.variantId || "").join(","),
      storeId: storeId.toString(),
    },

    ...(canSplit && {
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: store.stripeAccountId,
        },
      },
    }),
  });

  return NextResponse.json({ url: session.url });
}
