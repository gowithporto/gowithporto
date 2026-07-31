import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    userEmail: { type: String, required: true, index: true },
    stripeSessionId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "eur" },
    creditsAdded: { type: Number, required: true },
    cardBrand: { type: String },
    cardLast4: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
