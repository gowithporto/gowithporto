import mongoose, { Schema, models } from "mongoose";

const BikeRentalProviderSchema = new Schema(
  {
    name: { type: String, required: true },
    coverImage: { type: String, required: true },
    address: String,
    googleMapsUrl: { type: String, required: true },
    startingPrice: String,
    rating: Number,
    reviewCount: Number,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.BikeRentalProvider ||
  mongoose.model("BikeRentalProvider", BikeRentalProviderSchema);
