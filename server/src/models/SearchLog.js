// SearchLog: the Mongoose model for the searchlogs collection. Owner: Gerald.
import mongoose from "mongoose";

const { Schema } = mongoose;

const searchLogSchema = new Schema(
  {
    query: { type: String, required: true },
    filters: Schema.Types.Mixed,
    source: { type: String, enum: ["direct", "ai"], required: true },
    resultCount: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const SearchLog = mongoose.model("SearchLog", searchLogSchema);
