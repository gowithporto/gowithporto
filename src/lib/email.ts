import { Resend } from "resend";
import User from "@/models/User";
import {
  contactMessageHtml,
  contactMessageSubject,
  type ContactMessageData,
} from "./emailTemplates/contactMessage";
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
  disputeResolvedHtml,
  disputeResolvedSubject,
  type DisputeResolvedData,
} from "./emailTemplates/disputeResolved";
import {
  orderDispatchedHtml,
  orderDispatchedSubject,
  type OrderDispatchedData,
} from "./emailTemplates/orderDispatched";
import {
  orderReadyForPickupHtml,
  orderReadyForPickupSubject,
  type OrderReadyForPickupData,
} from "./emailTemplates/orderReadyForPickup";
import {
  orderShippedHtml,
  orderShippedSubject,
  type OrderShippedData,
} from "./emailTemplates/orderShipped";
import { welcomeHtml, welcomeSubject, type WelcomeData } from "./emailTemplates/welcome";
import {
  adminNewUserHtml,
  adminNewUserSubject,
  type AdminNewUserData,
} from "./emailTemplates/adminNewUser";
import {
  adminPayoutHtml,
  adminPayoutSubject,
  type AdminPayoutData,
} from "./emailTemplates/adminPayout";
import {
  adminDisputeAlertHtml,
  adminDisputeAlertSubject,
  type AdminDisputeAlertData,
} from "./emailTemplates/adminDisputeAlert";
import {
  newOrderForStoreOwnerHtml,
  newOrderForStoreOwnerSubject,
  type NewOrderForStoreOwnerData,
} from "./emailTemplates/newOrderForStoreOwner";
import Store from "@/models/Store";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gowithporto.pt";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "GoWithPorto <onboarding@resend.dev>";

/**
 * Emails must never break the flow that triggers them (checkout, credits, login).
 * Every send goes through here so failures are logged, not thrown.
 */
async function send(to: string, subject: string, html: string, replyTo?: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return;
  }
  if (!to) {
    console.warn(`[email] No recipient — skipped "${subject}"`);
    return;
  }

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
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

export function sendOrderDispatchedEmail(to: string, data: OrderDispatchedData) {
  return send(to, orderDispatchedSubject(data), orderDispatchedHtml(data));
}

export function sendOrderReadyForPickupEmail(to: string, data: OrderReadyForPickupData) {
  return send(to, orderReadyForPickupSubject(data), orderReadyForPickupHtml(data));
}

export function sendDisputeResolvedEmail(to: string, data: DisputeResolvedData) {
  return send(to, disputeResolvedSubject(data), disputeResolvedHtml(data));
}

export function sendCreditReceiptEmail(to: string, data: CreditReceiptData) {
  return send(to, creditReceiptSubject(), creditReceiptHtml(data));
}

export function sendWelcomeEmail(to: string, data: WelcomeData) {
  return send(to, welcomeSubject(), welcomeHtml(data));
}

/** Notifies the support inbox of a contact-form submission; reply-to is the submitter's email. */
export function sendContactMessageEmail(data: ContactMessageData) {
  const supportEmail = process.env.SUPPORT_EMAIL || "support@gowithporto.pt";
  return send(supportEmail, contactMessageSubject(data), contactMessageHtml(data), data.email);
}

/** Notifies the admin inbox whenever a new user registers. */
export function sendAdminNewUserEmail(data: AdminNewUserData) {
  return send(ADMIN_EMAIL, adminNewUserSubject(data), adminNewUserHtml(data));
}

/** Notifies the admin inbox when Stripe pays out (or fails to pay out) the platform balance to the linked bank account. */
export function sendAdminPayoutEmail(data: AdminPayoutData) {
  return send(ADMIN_EMAIL, adminPayoutSubject(data), adminPayoutHtml(data));
}

/** Notifies the admin inbox the moment a dispute exists — reported by buyer/handler, or auto-detected after the 24h unconfirmed timeout. */
export function sendAdminDisputeAlertEmail(data: AdminDisputeAlertData) {
  return send(ADMIN_EMAIL, adminDisputeAlertSubject(data), adminDisputeAlertHtml(data));
}

/** Notifies a store owner that a new order has come in. */
export function sendNewOrderForStoreOwnerEmail(to: string, data: NewOrderForStoreOwnerData) {
  return send(to, newOrderForStoreOwnerSubject(data), newOrderForStoreOwnerHtml(data));
}

interface OrderLike {
  _id: { toString(): string };
  userEmail?: string;
  items: { title?: string; price?: number; quantity?: number; image?: string }[];
  total: number;
  cardBrand?: string;
  cardLast4?: string;
  createdAt?: Date;
  storeId?: { toString(): string };
  deliveryType?: "pickup" | "delivery";
}

function orderNumber(order: OrderLike) {
  return `#ORD-${order._id.toString().slice(-6).toUpperCase()}`;
}

interface OrderItemLike {
  title?: string;
  etaText?: string;
  resolution?: {
    outcome?: string;
    buyerRefundAmount?: number;
  };
  issueReport?: {
    reportedBy?: "buyer" | "handler" | "system";
    reasonCode?: string;
    note?: string;
  };
}

function formatReasonCode(code?: string) {
  if (!code) return "Unspecified";
  return code
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
    shippedDate: new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });
}

/** Composes and sends the "dispatched" email for a single item on an order. */
export async function sendOrderDispatchedForOrder(order: OrderLike, item: OrderItemLike) {
  if (!order.userEmail) return;

  const recipientName = await recipientNameFor(order.userEmail);

  await sendOrderDispatchedEmail(order.userEmail, {
    recipientName,
    orderNumber: orderNumber(order),
    itemTitle: item.title || "Item",
    etaText: item.etaText || "Soon",
  });
}

/** Composes and sends the "ready for pickup" email for a single item on an order. */
export async function sendOrderReadyForPickupForOrder(
  order: OrderLike,
  item: OrderItemLike,
  storeName?: string
) {
  if (!order.userEmail) return;

  const recipientName = await recipientNameFor(order.userEmail);

  await sendOrderReadyForPickupEmail(order.userEmail, {
    recipientName,
    orderNumber: orderNumber(order),
    itemTitle: item.title || "Item",
    etaText: item.etaText || "Soon",
    storeName: storeName || "the store",
  });
}

/** Composes and sends the dispute-resolution outcome email for a single item on an order. */
export async function sendDisputeResolvedForOrder(order: OrderLike, item: OrderItemLike) {
  if (!order.userEmail) return;

  const recipientName = await recipientNameFor(order.userEmail);

  await sendDisputeResolvedEmail(order.userEmail, {
    recipientName,
    orderNumber: orderNumber(order),
    itemTitle: item.title || "Item",
    outcome: (item.resolution?.outcome as DisputeResolvedData["outcome"]) || "buyer_fault",
    buyerRefundAmount: item.resolution?.buyerRefundAmount || 0,
  });
}

/** Notifies the admin inbox immediately when a dispute is created — reported by buyer/handler, or system-detected after the 24h unconfirmed timeout. */
export async function sendAdminDisputeAlertForOrder(
  order: OrderLike,
  item: OrderItemLike,
  source: "buyer" | "handler" | "timeout"
) {
  const store = order.storeId ? await Store.findById(order.storeId).select("name") : null;

  await sendAdminDisputeAlertEmail({
    source,
    orderNumber: orderNumber(order),
    storeName: store?.name || "Unknown store",
    itemTitle: item.title || "Item",
    reasonLabel: formatReasonCode(item.issueReport?.reasonCode),
    note: item.issueReport?.note,
  });
}

/** Notifies the store owner that a new order has come in — silent no-op if the store has no email on file yet. */
export async function sendNewOrderAlertForOrder(order: OrderLike) {
  if (!order.storeId) return;

  const store = await Store.findById(order.storeId).select("name email");
  if (!store?.email) return;

  await sendNewOrderForStoreOwnerEmail(store.email, {
    storeName: store.name,
    orderNumber: orderNumber(order),
    deliveryType: order.deliveryType || "pickup",
    items: order.items.map((item) => ({
      title: item.title || "Item",
      quantity: item.quantity || 1,
      price: item.price || 0,
    })),
    total: order.total,
  });
}
