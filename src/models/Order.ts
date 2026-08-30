import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  name: String,
  street: String,
  city: String,
  postalCode: String,
  country: String,
});

const IssueReportSchema = new mongoose.Schema(
  {
    reportedBy: { type: String, enum: ["buyer", "handler", "system"] },
    reasonCode: String,
    note: String,
    reportedAt: Date,
  },
  { _id: false }
);

const ResolutionSchema = new mongoose.Schema(
  {
    outcome: { type: String, enum: ["seller_fault", "buyer_fault", "split"] },
    buyerRefundAmount: Number,
    sellerAmount: Number,
    platformAmount: Number,
    deliveryFeeHandling: {
      type: String,
      enum: ["refunded", "kept_by_seller", "not_applicable"],
    },
    stripeRefundId: String,
    stripeTransferId: String,
    resolvedBy: String,
    resolvedAt: Date,
    notes: String,
  },
  { _id: false }
);

const LegalExceptionSchema = new mongoose.Schema(
  {
    requested: Boolean,
    reason: String,
    amount: Number,
    transferReversalId: String,
    refundId: String,
    processedBy: String,
    processedAt: Date,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userEmail: String,
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    stripeSessionId: { type: String, unique: true, sparse: true },
    paymentIntentId: String,
    chargeId: String,
    commissionRateSnapshot: Number,
    deliveryFeeTransferred: { type: Boolean, default: false },
    deliveryFeeTransferId: String,
    deliveryFeeTransferError: String,
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        variantId: String,
        variantName: String,
        title: String,
        price: Number,
        quantity: Number,
        image: String,

        fulfillmentToken: { type: String, index: { unique: true, sparse: true } },
        fulfillmentStatus: {
          type: String,
          enum: [
            "pending",
            "dispatched",
            "ready_for_pickup",
            "delivered",
            "picked_up",
            "issue_reported",
            "resolved",
          ],
          default: "pending",
        },
        etaText: String,
        dispatchedAt: Date,
        confirmedAt: Date,
        staleAlertSentAt: Date,

        transferId: String,
        transferAmount: Number,
        transferredAt: Date,
        transferPending: Boolean,
        transferError: String,

        issueReport: IssueReportSchema,
        resolution: ResolutionSchema,
        legalException: LegalExceptionSchema,
      },
    ],
    total: Number,
    deliveryType: { type: String, enum: ["pickup", "delivery"] },
    deliveryFee: { type: Number, default: 0 },
    deliveryZone: String,
    platformFeeAmount: Number,
    storeOwnerAmount: Number,
    storeStripeAccountId: String,
    address: AddressSchema,
    cardBrand: String,
    cardLast4: String,
    status: {
      type: String,
      default: "paid",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
