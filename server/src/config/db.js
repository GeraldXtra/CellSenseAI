// db: opens the MongoDB connection with Mongoose when MONGODB_URI is set. Owner: Gerald.
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  if (!env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI is empty in the server/.env nor a fallback in the .env.js, so the database is not connected",
    );
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
  }
}
