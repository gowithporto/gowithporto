// One-off / re-runnable backfill: AI-translates Product/Attraction/LocalExperience
// content into fr/es/pt and stores it under each document's `translations` field.
// Idempotent — skips a locale for a doc once it already has a translation, so it's
// safe to re-run later to pick up new products/attractions/experiences.
// Usage: node --env-file=.env.local scripts/translate-content.js
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const LOCALES = ["fr", "es", "pt"];
// The Gemini free tier caps at 5 requests/minute — 13s keeps us under that with margin.
const DELAY_MS = 13000;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelayFromError(err) {
  const match = /retry in ([\d.]+)s/i.exec(err?.message || "");
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 1000 : DELAY_MS;
}

// Pinned to match src/services/ai/geminiProvider.ts — see that file for why "latest" is avoided.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3.7-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const Mixed = mongoose.Schema.Types.Mixed;

const Product =
  mongoose.models.Product ||
  mongoose.model(
    "Product",
    new mongoose.Schema({
      title: String,
      description: String,
      translations: { type: Mixed, default: {} },
    })
  );

const Attraction =
  mongoose.models.Attraction ||
  mongoose.model(
    "Attraction",
    new mongoose.Schema({
      title: String,
      shortDescription: String,
      history: String,
      highlights: [String],
      bestTimeToVisit: String,
      openingHours: String,
      entryFee: String,
      howToGetThere: String,
      translations: { type: Mixed, default: {} },
    })
  );

const LocalExperience =
  mongoose.models.LocalExperience ||
  mongoose.model(
    "LocalExperience",
    new mongoose.Schema({
      title: String,
      shortDescription: String,
      story: String,
      highlights: [String],
      included: [String],
      meetingPoint: String,
      groupSize: String,
      cancellationPolicy: String,
      translations: { type: Mixed, default: {} },
    })
  );

const COLLECTIONS = [
  {
    name: "Product",
    model: Product,
    fields: ["title", "description"],
  },
  {
    name: "Attraction",
    model: Attraction,
    fields: [
      "title",
      "shortDescription",
      "history",
      "highlights",
      "bestTimeToVisit",
      "openingHours",
      "entryFee",
      "howToGetThere",
    ],
  },
  {
    name: "LocalExperience",
    model: LocalExperience,
    fields: [
      "title",
      "shortDescription",
      "story",
      "highlights",
      "included",
      "meetingPoint",
      "groupSize",
      "cancellationPolicy",
    ],
  },
];

function missingLocales(doc) {
  const translations = doc.translations || {};
  return LOCALES.filter((l) => !translations[l] || Object.keys(translations[l]).length === 0);
}

function buildSourcePayload(doc, fields) {
  const payload = {};
  for (const field of fields) {
    const value = doc[field];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    payload[field] = value;
  }
  return payload;
}

async function translateDoc(doc, fields, locales) {
  const source = buildSourcePayload(doc, fields);
  if (Object.keys(source).length === 0) return null;

  const prompt = `You are a professional translator for GoWithPorto, a Porto (Portugal) tourism and souvenir e-commerce website.
Translate the string and array-of-string values in the JSON object below from English into: ${locales.join(", ")}.
"pt" means European Portuguese (Portugal), NOT Brazilian Portuguese.
Rules:
- Preserve the exact same keys as the source object.
- For array values, return an array with the same number of items, each translated, in the same order.
- Keep proper nouns, brand names, and place names as-is when they are normally left untranslated (e.g. "Dom Luís I Bridge", "Ribeira").
- Keep the tone warm and natural for a travel/shopping audience, not literal word-for-word.
- Return ONLY a JSON object shaped like: { ${locales.map((l) => `"${l}": { ...same keys as source... }`).join(", ")} }. No other text.

Source JSON:
${JSON.stringify(source, null, 2)}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      const isQuotaError = err?.message?.includes("429") || err?.message?.includes("Too Many Requests");
      if (isQuotaError && attempt < MAX_RETRIES) {
        const wait = retryDelayFromError(err);
        console.log(`    rate limited, waiting ${Math.round(wait / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

async function runCollection({ name, model: Model, fields }) {
  const docs = await Model.find({});
  let translated = 0;
  let skipped = 0;
  let errored = 0;

  console.log(`\n${name}: ${docs.length} documents`);

  for (const doc of docs) {
    const locales = missingLocales(doc);
    if (locales.length === 0) {
      skipped++;
      continue;
    }

    try {
      const result = await translateDoc(doc, fields, locales);
      if (!result) {
        skipped++;
        continue;
      }

      const update = {};
      for (const locale of locales) {
        if (result[locale]) {
          update[`translations.${locale}`] = result[locale];
        }
      }

      if (Object.keys(update).length > 0) {
        await Model.updateOne({ _id: doc._id }, { $set: update });
        translated++;
        console.log(`  ✓ ${doc.title || doc._id} (${locales.join(", ")})`);
      } else {
        skipped++;
      }
    } catch (err) {
      errored++;
      console.error(`  ✗ ${doc.title || doc._id}:`, err.message);
    }

    await sleep(DELAY_MS);
  }

  console.log(`${name} done — translated: ${translated}, skipped: ${skipped}, errored: ${errored}`);
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.name}`);

  for (const collection of COLLECTIONS) {
    await runCollection(collection);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
