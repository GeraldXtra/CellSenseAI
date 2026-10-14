// Review: the Mongoose model for the reviews collection. Owner: Gerald.
import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    phone: {
      type: Schema.Types.ObjectId,
      ref: "Phone",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    author: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
  },
  { timestamps: true },
);

reviewSchema.index({ phone: 1, user: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
