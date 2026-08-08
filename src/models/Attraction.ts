import mongoose, { Schema, models } from "mongoose";

const NearbyPlaceSchema = new Schema(
  {
    name: String,
    blurb: String,
    image: String,
    externalLink: String,
    distance: String,
    rating: Number,
    reviewCount: Number,
  },
  { _id: false }
);

const AttractionSchema = new Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    category: String,
    area: String,
    shortDescription: String,
    history: String,
    highlights: [String],
    coverImage: String,
    gallery: [String],
    bestTimeToVisit: String,
    openingHours: String,
    entryFee: String,
    howToGetThere: String,
    mapUrl: String,
    nearbyHotels: [NearbyPlaceSchema],
    nearbyRestaurants: [NearbyPlaceSchema],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Attraction || mongoose.model("Attraction", AttractionSchema);
