// runPriceUpdate: runs the price updater once from the command line. Owner: Gerald.
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { runPriceUpdate } from "../src/jobs/priceUpdater.js";

await connectDB();
if (mongoose.connection.readyState !== 1) {
  console.error(
    "Price check stopped: no database connection. Check MONGODB_URI in server/.env.",
  );
  process.exit(1);
}

try {
  await runPriceUpdate();
} catch (err) {
  console.error(`Price check failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
