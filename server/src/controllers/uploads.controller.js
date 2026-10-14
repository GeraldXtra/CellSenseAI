// uploadsController: sends the phone pictures an admin uploaded, read from the phonepictures collection. Owner: Gerald.
import { PhonePicture } from "../models/PhonePicture.js";
import { httpError } from "../utils/http.js";

const PICTURE_FILE = /^([a-z0-9-]+)\.png$/;

export async function getPhonePicture(req, res) {
  const match = PICTURE_FILE.exec(req.params.file);
  const picture = match
    ? await PhonePicture.findOne({ slug: match[1] }).select("data")
    : null;
  if (!picture) throw httpError(404, "Picture not found");

  res.set({
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  return res.send(picture.data);
}
