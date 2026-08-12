import mongoose, { Schema, models } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userEmail: { type: String, required: true },
    itemType: {
      type: String,
      enum: ["product", "attraction", "localExperience", "bikeRental"],
      required: true,
    },
    itemId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userEmail: 1, itemType: 1, itemId: 1 }, { unique: true });

export default models.Favorite || mongoose.model("Favorite", FavoriteSchema);
