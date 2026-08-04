import mongoose, { Document, Schema, models } from "mongoose";

export interface IStore extends Document {
  name: string;
  slug: string;
  location: string;
  active: boolean;

  // 🔐 Store Owner Auth
  storeCode: string;
  passwordHash: string;
  role: "STORE_OWNER";
  deliveryFee: number;

  // 💳 Stripe Connect (payouts)
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  commissionRate: number;

  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    active: { type: Boolean, default: true },

    // 🔐 Store Owner Auth
    storeCode: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "STORE_OWNER" },
    deliveryFee: {
      type: Number,
      default: 0,
    },

    // 💳 Stripe Connect (payouts)
    stripeAccountId: { type: String },
    stripeOnboardingComplete: { type: Boolean, default: false },
    commissionRate: { type: Number, default: 10 }, // percent kept by the platform
  },
  { timestamps: true }
);

export default models.Store || mongoose.model<IStore>("Store", StoreSchema);
