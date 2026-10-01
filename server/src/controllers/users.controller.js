// usersController: the request handlers for the users routes (dashboard, favourites). Owner: Gerald.
import { Phone } from "../models/Phone.js";
import { User } from "../models/User.js";
import { ok, httpError } from "../utils/http.js";

async function findPhoneId(slug) {
  const phone = await Phone.findOne({ slug }).select("_id").lean();
  if (!phone) throw httpError(404, "Phone not found");
  return phone._id;
}

async function favouritesOf(userId) {
  const user = await User.findById(userId)
    .select("favourites")
    .populate("favourites")
    .lean();
  return [...user.favourites].filter(Boolean).reverse();
}

export async function getDashboard(req, res) {
  const user = await User.findById(req.user._id)
    .select("recentlyViewed favourites searchHistory recommendations")
    .populate("recentlyViewed.phone")
    .populate("favourites")
    .populate("recommendations.phone")
    .lean();

  return ok(res, {
    recentlyViewed: user.recentlyViewed
      .map((entry) => entry.phone)
      .filter(Boolean),
    favourites: [...user.favourites].filter(Boolean).reverse(),
    searchHistory: user.searchHistory,
    recommendations: user.recommendations.filter((entry) => entry.phone),
  });
}

export async function addFavourite(req, res) {
  const phoneId = await findPhoneId(req.params.slug);
  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { favourites: phoneId } },
  );
  return ok(res, { favourites: await favouritesOf(req.user._id) });
}

export async function removeFavourite(req, res) {
  const phoneId = await findPhoneId(req.params.slug);
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { favourites: phoneId } },
  );
  return ok(res, { favourites: await favouritesOf(req.user._id) });
}
