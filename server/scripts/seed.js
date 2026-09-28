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
}
