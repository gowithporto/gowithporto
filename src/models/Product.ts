import mongoose, { Schema, models } from "mongoose";

const VariantSchema = new Schema({
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, default: 0 },
});

const ProductSchema = new Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    description: String,
    price: Number,
    images: [String],
    category: String,
    quantity: { type: Number, default: 0 },
    variants: [VariantSchema],

    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },

    active: { type: Boolean, default: true },

    // Optional per-locale overrides for translatable fields, e.g. { fr: { title, description }, es: {...}, pt: {...} }
    translations: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default models.Product || mongoose.model("Product", ProductSchema);
