import { Resend } from "resend";
import User from "@/models/User";
import {
  creditReceiptHtml,
  creditReceiptSubject,
  type CreditReceiptData,
} from "./emailTemplates/creditReceipt";
import {
  orderConfirmationHtml,
  orderConfirmationSubject,
  type OrderConfirmationData,
} from "./emailTemplates/orderConfirmation";
import {
  orderShippedHtml,
  orderShippedSubject,
  type OrderShippedData,
} from "./emailTemplates/orderShipped";
import { welcomeHtml, welcomeSubject, type WelcomeData } from "./emailTemplates/welcome";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "GoWithPorto <onboarding@resend.dev>";

/**
 * Emails must never break the flow that triggers them (checkout, credits, login).
 * Every send goes through here so failures are logged, not thrown.
 */
async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return;
  }
  if (!to) {
    console.warn(`[email] No recipient — skipped "${subject}"`);
    return;
  }

  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    if (result.error) {
      console.error(`[email] Resend rejected "${subject}" to ${to}:`, result.error);
    } else {
      console.log(`[email] Sent "${subject}" to ${to} (id: ${result.data?.id})`);
    }
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}

export function sendOrderConfirmationEmail(to: string, data: OrderConfirmationData) {
  return send(to, orderConfirmationSubject(data), orderConfirmationHtml(data));
}

export function sendOrderShippedEmail(to: string, data: OrderShippedData) {
  return send(to, orderShippedSubject(data), orderShippedHtml(data));
}

export function sendCreditReceiptEmail(to: string, data: CreditReceiptData) {
  return send(to, creditReceiptSubject(), creditReceiptHtml(data));
}

export function sendWelcomeEmail(to: string, data: WelcomeData) {
  return send(to, welcomeSubject(), welcomeHtml(data));
}

interface OrderLike {
  _id: { toString(): string };
  userEmail?: string;
  items: { title?: string; price?: number; quantity?: number; image?: string }[];
  total: number;
  cardBrand?: string;
  cardLast4?: string;
  createdAt?: Date;
}

function orderNumber(order: OrderLike) {
  return `#ORD-${order._id.toString().slice(-6).toUpperCase()}`;
}

async function recipientNameFor(email: string) {
  const user = await User.findOne({ email }).select("name");
  return user?.name || email.split("@")[0];
}

/** Composes and sends the order-confirmation email from a saved Order document. */
export async function sendOrderConfirmationForOrder(order: OrderLike) {
  if (!order.userEmail) return;

  const recipientName = await recipientNameFor(order.userEmail);

  await sendOrderConfirmationEmail(order.userEmail, {
    recipientName,
    orderNumber: orderNumber(order),
    orderDate: (order.createdAt ?? new Date()).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    paymentMethod:
      order.cardBrand && order.cardLast4
        ? `${order.cardBrand.charAt(0).toUpperCase()}${order.cardBrand.slice(1)} •••• ${order.cardLast4}`
        : undefined,
    items: order.items.map((item) => ({
      title: item.title || "Item",
      quantity: item.quantity || 1,
      price: item.price || 0,
      image: item.image,
    })),
    total: order.total,
  });
}

/** Composes and sends the order-shipped email from a saved Order document. */
export async function sendOrderShippedForOrder(order: OrderLike) {
  if (!order.userEmail) return;

  const recipientName = await recipientNameFor(order.userEmail);

  await sendOrderShippedEmail(order.userEmail, {
    recipientName,
    orderNumber: orderNumber(order),
  });
}
