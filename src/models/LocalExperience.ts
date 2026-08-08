import mongoose, { Schema, models } from "mongoose";

const LocalExperienceSchema = new Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    category: String,
    area: String,
    shortDescription: String,
    story: String,
    highlights: [String],
    included: [String],
    gallery: [String],
    coverImage: String,
    duration: String,
    durationCategory: String,
    price: Number,
    rating: Number,
    reviewCount: { type: Number, default: 0 },
    meetingPoint: String,
    groupSize: String,
    cancellationPolicy: String,
    mapUrl: String,
    popular: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.LocalExperience ||
  mongoose.model("LocalExperience", LocalExperienceSchema);
