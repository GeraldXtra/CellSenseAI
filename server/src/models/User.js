// User: the Mongoose model for the users collection. Owner: Gerald.
import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Phone" }],
    recentlyViewed: [
      {
        _id: false,
        phone: { type: Schema.Types.ObjectId, ref: "Phone" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    searchHistory: [
      {
        _id: false,
        query: String,
        filters: Schema.Types.Mixed,
        at: { type: Date, default: Date.now },
      },
    ],
    recommendations: [
      {
        _id: false,
        phone: { type: Schema.Types.ObjectId, ref: "Phone" },
        reason: String,
        at: { type: Date, default: Date.now },
      },
    ],
    passwordReset: {
      tokenHash: String,
      expiresAt: Date,
    },
  },
  { timestamps: true },
);

userSchema.methods.toSafeJSON = function () {
  return { _id: this._id, name: this.name, email: this.email, role: this.role };
};

export const User = mongoose.model("User", userSchema);
