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

let saved = 0;
for (const item of phones) {
  const slug = Slugify(`${item.brand} ${item.model}`);
  const history = (
    item.priceHistory || [{ price: item.price, data: new Date() }]
  ).map((point) => ({
    price: point.price,
    date: new Date(point.date),
    source: "seed",
  }));
  const last = history[history.length - 1];

  await Phone.findOneAndUpdate(
    { slug },
    {
      ...item,
      slug,
      price: { current: item.price, currency: "USD", updatedAt: last.date },
      priceHistory: history,
      source: "seed",
    },
    { upsert: true, runValidators: true },
  );
  saved += 1;
}

console.log(`Seeded ${saved} phones`);
await mongoose.disconnect();
