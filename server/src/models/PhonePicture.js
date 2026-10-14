// PhonePicture: the Mongoose model for the phonepictures collection, the pictures an admin uploads. Owner: Gerald.
import mongoose from "mongoose";

const { Schema } = mongoose;

const phonePictureSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    data: { type: Buffer, required: true },
    contentType: { type: String, default: "image/png" },
    size: { type: Number, required: true },
  },
  { timestamps: true },
);

export const PhonePicture = mongoose.model("PhonePicture", phonePictureSchema);
