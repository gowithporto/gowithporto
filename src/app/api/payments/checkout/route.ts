import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Store from "@/models/Store";
import mongoose from "mongoose";
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

  // Money no longer splits at checkout — the full charge goes to the platform's
  // own Stripe balance. The seller's cut only transfers once delivery/pickup is
  // confirmed (see /api/fulfill/[token]/confirm), using this pre-generated id as
  // both the Order's _id and the PaymentIntent's transfer_group for 1:1 reconciliation.
  const orderId = new mongoose.Types.ObjectId();

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
      orderId: orderId.toString(),
      deliveryType,
      deliveryFee,
      address: address ? JSON.stringify(address) : "",
      productIds: items.map((i: any) => i.productId).join(","),
      variantIds: items.map((i: any) => i.variantId || "").join(","),
      storeId: storeId.toString(),
    },

    payment_intent_data: {
      transfer_group: orderId.toString(),
    },
  });

  return NextResponse.json({ url: session.url });
}
