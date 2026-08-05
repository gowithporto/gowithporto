import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  name: String,
  street: String,
  city: String,
  postalCode: String,
  country: String,
});

const OrderSchema = new mongoose.Schema(
  {
    userEmail: String,
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    stripeSessionId: { type: String, unique: true, sparse: true },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    total: Number,
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
