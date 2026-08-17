// Populates the local dev database with a handful of test records so pages
// aren't empty. Upserts on slug (idempotent, safe to re-run) — never deletes
// anything, unlike the old HTTP seed route this replaces.
// Usage: node --env-file=.env.local scripts/seed-dev-data.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const PRODUCTION_HOST = "cluster0.6mxerbh.mongodb.net";

async function main() {
  const uri = process.env.MONGODB_URI || "";
  if (uri.includes(PRODUCTION_HOST)) {
    console.error(
      "Refusing to run: MONGODB_URI points at the production cluster " +
        `(${PRODUCTION_HOST}). Point .env.local at the dev cluster first.`
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const Store =
    mongoose.models.Store ||
    mongoose.model(
      "Store",
      new mongoose.Schema(
        {
          name: String,
          slug: { type: String, unique: true },
          location: String,
          active: { type: Boolean, default: true },
          storeCode: { type: String, unique: true },
          passwordHash: String,
          role: { type: String, default: "STORE_OWNER" },
          deliveryFee: { type: Number, default: 0 },
          fulfillmentPinHash: String,
          stripeAccountId: String,
          stripeOnboardingComplete: { type: Boolean, default: false },
          commissionRate: { type: Number, default: 10 },
        },
        { timestamps: true }
      )
    );

  const Category =
    mongoose.models.Category ||
    mongoose.model(
      "Category",
      new mongoose.Schema(
        { name: String, slug: { type: String, unique: true }, image: String },
        { timestamps: true }
      )
    );

  const Product =
    mongoose.models.Product ||
    mongoose.model(
      "Product",
      new mongoose.Schema(
        {
          title: String,
          slug: { type: String, unique: true },
          description: String,
          price: Number,
          images: [String],
          category: String,
          quantity: { type: Number, default: 0 },
          storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
          active: { type: Boolean, default: true },
        },
        { timestamps: true }
      )
    );

  const Attraction =
    mongoose.models.Attraction ||
    mongoose.model(
      "Attraction",
      new mongoose.Schema(
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
          featured: { type: Boolean, default: false },
          active: { type: Boolean, default: true },
        },
        { timestamps: true }
      )
    );

  const LocalExperience =
    mongoose.models.LocalExperience ||
    mongoose.model(
      "LocalExperience",
      new mongoose.Schema(
        {
          title: String,
          slug: { type: String, unique: true },
          category: String,
          area: String,
          shortDescription: String,
          story: String,
          highlights: [String],
          included: [String],
          coverImage: String,
          duration: String,
          price: Number,
          rating: Number,
          reviewCount: { type: Number, default: 0 },
          meetingPoint: String,
          groupSize: String,
          cancellationPolicy: String,
          popular: { type: Boolean, default: false },
          featured: { type: Boolean, default: false },
          active: { type: Boolean, default: true },
        },
        { timestamps: true }
      )
    );

  const PLACEHOLDER_IMG = "https://placehold.co/800x600/1a4d3e/ffffff?text=Dev+Seed";

  const store = await Store.findOneAndUpdate(
    { slug: "dev-test-store" },
    {
      name: "Dev Test Store",
      slug: "dev-test-store",
      location: "Ribeira, Porto",
      storeCode: "DEV-TEST",
      passwordHash: await bcrypt.hash("devtest123", 10),
      fulfillmentPinHash: await bcrypt.hash("1234", 10),
      deliveryFee: 3.5,
    },
    { upsert: true, new: true }
  );
  console.log(`Store ready: ${store.slug} (code DEV-TEST / password devtest123 / PIN 1234)`);

  const categories = [
    { name: "Food & Drink", slug: "food-drink", image: PLACEHOLDER_IMG },
    { name: "Souvenirs", slug: "souvenirs", image: PLACEHOLDER_IMG },
  ];
  for (const c of categories) {
    await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
  }
  console.log(`Categories ready: ${categories.map((c) => c.slug).join(", ")}`);

  const products = [
    {
      title: "Port Wine — Tawny 10 Years",
      slug: "port-wine-tawny-10-years",
      description: "A smooth, nutty tawny port from a small Douro producer.",
      price: 24.9,
      images: [PLACEHOLDER_IMG],
      category: "food-drink",
      quantity: 25,
      storeId: store._id,
    },
    {
      title: "Azulejo Tile Coaster Set",
      slug: "azulejo-tile-coaster-set",
      description: "Hand-painted ceramic coasters in the classic Porto blue pattern.",
      price: 18,
      images: [PLACEHOLDER_IMG],
      category: "souvenirs",
      quantity: 40,
      storeId: store._id,
    },
  ];
  for (const p of products) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
  }
  console.log(`Products ready: ${products.map((p) => p.slug).join(", ")}`);

  const attractions = [
    {
      title: "Livraria Lello",
      slug: "livraria-lello",
      category: "landmark",
      area: "Baixa",
      shortDescription: "One of the most beautiful bookshops in the world.",
      history: "Opened in 1906, known for its neo-Gothic facade and red staircase.",
      highlights: ["Neo-Gothic interior", "Stained-glass skylight", "Red spiral staircase"],
      coverImage: PLACEHOLDER_IMG,
      gallery: [PLACEHOLDER_IMG],
      bestTimeToVisit: "Early morning, before tour groups arrive",
      openingHours: "09:30 - 19:00",
      entryFee: "€8 (redeemable against a book purchase)",
      howToGetThere: "10 min walk from São Bento station",
      featured: true,
    },
    {
      title: "Ribeira Waterfront",
      slug: "ribeira-waterfront",
      category: "landmark",
      area: "Ribeira",
      shortDescription: "Porto's UNESCO-listed riverside district.",
      history: "The historic heart of Porto, facing the Douro river and Dom Luís I bridge.",
      highlights: ["Dom Luís I Bridge views", "Riverside cafés", "Colorful facades"],
      coverImage: PLACEHOLDER_IMG,
      gallery: [PLACEHOLDER_IMG],
      bestTimeToVisit: "Sunset",
      openingHours: "Always open",
      entryFee: "Free",
      howToGetThere: "Walkable from the city center",
      featured: false,
    },
  ];
  for (const a of attractions) {
    await Attraction.findOneAndUpdate({ slug: a.slug }, a, { upsert: true });
  }
  console.log(`Attractions ready: ${attractions.map((a) => a.slug).join(", ")}`);

  const experiences = [
    {
      title: "Traditional Petiscos Tasting Walk",
      slug: "traditional-petiscos-tasting-walk",
      category: "food",
      area: "Bolhão",
      shortDescription: "A guided walk through Porto's best petiscos bars.",
      story: "Sample small plates across three family-run tascas near the Bolhão market.",
      highlights: ["3 tasting stops", "Local host", "Small group, max 8 people"],
      included: ["Food tastings", "One drink per stop", "Local guide"],
      coverImage: PLACEHOLDER_IMG,
      duration: "2.5 hours",
      price: 45,
      rating: 4.8,
      reviewCount: 12,
      meetingPoint: "Bolhão Market entrance",
      groupSize: "Up to 8 people",
      cancellationPolicy: "Free cancellation up to 24 hours before",
      popular: true,
      featured: true,
    },
  ];
  for (const e of experiences) {
    await LocalExperience.findOneAndUpdate({ slug: e.slug }, e, { upsert: true });
  }
  console.log(`Local experiences ready: ${experiences.map((e) => e.slug).join(", ")}`);

  console.log("Dev seed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
