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

  const storeId = products[0].storeId;
  const store = await Store.findById(storeId);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    products.map((product) => {
      const cartItem = items.find(
        (i: any) => i.productId === product._id.toString()
      );

      return {
        quantity: cartItem.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.title,
          },
        },
      };
    });

  // Platform commission is taken from product sales only — the store owner
  // keeps 100% of the delivery fee, since that's their shipping cost.
  const productsSubtotalCents = products.reduce((sum, product) => {
    const cartItem = items.find(
      (i: any) => i.productId === product._id.toString()
    );
    return sum + Math.round(product.price * 100) * cartItem.quantity;
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
      productIds: products.map((p) => p._id.toString()).join(","),
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
