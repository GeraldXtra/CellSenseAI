// phonesController: the request handlers for the phones routes (list, compare, detail, price trend, reviews). Owner: Gerald.
import { Phone } from "../models/Phone";
import { ok, httpError } from "../utils/http.js";

export async function listPhones(req, res) {
  const items = await Phone.find()
    .sort({ releaseYear: -1, brand: 1, model: 1 })
    .lean();
  return ok(res, { items, total: items.length, page: 1, pages: 1 });
}

export async function getPhone(req, res) {
  const phone = await Phone.findOne({ slug: req.params.slug }).lean();
  if (!phone) throw httpError(404, "Phone not found.");
  return ok(res, { phone });
}
