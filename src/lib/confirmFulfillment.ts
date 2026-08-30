import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!);

/**
 * Marks one order item as delivered/picked-up and transfers the seller's cut
 * (plus any un-transferred delivery fee) via Stripe Connect. Shared by the
 * buyer/handler PIN-confirm flow and the admin "Mark Delivered" action for
 * stale items — mutates `order`/`item` in place; the caller still does its
 * own `order.save()` and response.
 */
export async function confirmItemFulfillment(order: any, item: any, store: any) {
  const isPickup = order.deliveryType === "pickup";
  item.fulfillmentStatus = isPickup ? "picked_up" : "delivered";
  item.confirmedAt = new Date();

  const canTransfer = !!(store?.stripeAccountId && store?.stripeOnboardingComplete);
  const amountCents = Math.round(
    item.price * item.quantity * (1 - (order.commissionRateSnapshot ?? 0) / 100) * 100
  );

  if (canTransfer) {
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: amountCents,
          currency: "eur",
          destination: store!.stripeAccountId!,
          source_transaction: order.chargeId,
          transfer_group: order._id.toString(),
        },
        { idempotencyKey: `transfer:${order._id}:${item._id}` }
      );
      item.transferId = transfer.id;
      item.transferAmount = amountCents / 100;
      item.transferredAt = new Date();
    } catch (err: any) {
      item.transferPending = true;
      item.transferError = String(err?.message || err);
    }
  } else {
    item.transferPending = true;
    item.transferError = "Store not Connect-onboarded yet";
  }

  if (
    order.deliveryType === "delivery" &&
    order.deliveryFee > 0 &&
    !order.deliveryFeeTransferred &&
    canTransfer
  ) {
    try {
      const feeTransfer = await stripe.transfers.create(
        {
          amount: Math.round(order.deliveryFee * 100),
          currency: "eur",
          destination: store!.stripeAccountId!,
          source_transaction: order.chargeId,
          transfer_group: order._id.toString(),
        },
        { idempotencyKey: `transfer:${order._id}:deliveryFee` }
      );
      order.deliveryFeeTransferred = true;
      order.deliveryFeeTransferId = feeTransfer.id;
    } catch (err: any) {
      order.deliveryFeeTransferError = String(err?.message || err);
    }
  }
}
