import mongoose, { Schema, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    image: String,
  },
  { timestamps: true }
);

export default models.Category || mongoose.model("Category", CategorySchema);
