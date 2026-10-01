// seed: loads data/phones.json into the phones collection. Owner: Gerald.
import fs from "node:fs/promises";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Phone } from "../src/models/Phone.js";
import { Slugify } from "../src/utils/slug.js";

const file = new URL("../data/phones.json", import.meta.url);
const phones = JSON.parse(await fs.readFile(file, "utf8"));

await connectDB();
if (mongoose.connection.readyState !== 1) {
  console.error(
    "Seed stopped: no database connection. Check MONGODB_URI in server/.env.",
  );
  process.exit(1);
}

let added = 0;
let updated = 0;

for (const item of phones) {
  const slug = Slugify(`${item.brand} ${item.model}`);
  const history = (
    item.priceHistory || [{ price: item.price, date: new Date() }]
  ).map((point) => ({
    price: point.price,
    date: new Date(point.date),
    source: "seed",
  }));
  const last = history[history.length - 1];

  const set = {
    brand: item.brand,
    model: item.model,
    category: item.category,
    releaseYear: item.releaseYear,
    specs: item.specs,
  };
  if (item.imageUrl) set.imageUrl = item.imageUrl;
  if (item.aiSummary) set.aiSummary = item.aiSummary;

  const result = await Phone.updateOne(
    { slug },
    {
      $set: set,
      $setOnInsert: {
        slug,
        price: { current: item.price, currency: "USD", updatedAt: last.date },
        priceHistory: history,
        source: "seed",
      },
    },
    { upsert: true, runValidators: true },
  );

  if (result.upsertedCount) added += 1;
  else updated += 1;
}

console.log(`Seed: ${added} phones added, ${updated} updated`);
await mongoose.disconnect();
