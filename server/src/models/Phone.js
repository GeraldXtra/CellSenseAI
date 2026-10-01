// Phone: the Mongoose model for the phones collection. Owner: Gerald.
import mongoose from "mongoose";

const { Schema } = mongoose;

const phoneSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    category: {
      type: String,
      enum: ["budget", "midrange", "flagship", "gaming", "camera"],
      default: "midrange",
    },
    releaseYear: Number,
    specs: {
      processor: String,
      ram: Number,
      storage: Number,
      mainCamera: Number,
      frontCamera: Number,
      battery: Number,
      displaySize: Number,
      displayType: String,
      refreshRate: Number,
      os: String,
      has5G: { type: Boolean, default: false },
    },
    price: {
      current: { type: Number, require: true },
      currency: { type: String, default: "USD" },
      updatedAt: { type: Date, default: Date.now },
    },
    priceHistory: [
      {
        _id: false,
        price: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        source: {
          type: String,
          enum: ["seed", "ai", "api", "manual"],
          default: "seed",
        },
      },
    ],
    aiSummary: { type: String, default: "" },
    reviewSummary: {
      text: { type: String, default: "" },
      sentiment: {
        type: String,
        enum: ["positive", "neutral", "negative"],
        default: "neutral",
      },
      count: { type: Number, default: 0 },
    },
    source: { type: String, enum: ["seed", "ai", "admin"], default: "seed" },
  },
  { timestamps: true },
);

phoneSchema.index({ brand: 1 });
phoneSchema.index({ "price.current": 1 });

export const Phone = mongoose.model("Phone", phoneSchema);
