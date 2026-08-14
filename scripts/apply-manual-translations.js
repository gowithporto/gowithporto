// One-off: applies hand-translated fr/es/pt content (scripts/data/manual-translations-*.json)
// directly to MongoDB, bypassing the Gemini-based scripts/translate-content.js — used when the
// Gemini free-tier daily quota made finishing the backfill via API calls impractical.
// Usage: node --env-file=.env.local scripts/apply-manual-translations.js
const mongoose = require("mongoose");
const path = require("path");

async function applyFile(db, collectionName, fileName) {
  const entries = require(path.join(__dirname, "data", fileName));
  const collection = db.collection(collectionName);
  let updated = 0;

  for (const entry of entries) {
    const { _id, ...locales } = entry;
    const update = {};
    for (const [locale, fields] of Object.entries(locales)) {
      update[`translations.${locale}`] = fields;
    }

    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(_id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      console.error(`  ✗ No document found for _id ${_id}`);
    } else {
      updated++;
    }
  }

  console.log(`${collectionName}: updated ${updated}/${entries.length}`);
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.name}`);
  const db = mongoose.connection.db;

  await applyFile(db, "attractions", "manual-translations-attractions.json");
  await applyFile(db, "localexperiences", "manual-translations-experiences.json");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
