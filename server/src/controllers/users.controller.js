import { Phone } from "../models/Phone.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { SearchLog } from "../models/SearchLog.js";
import { ok, httpError } from "../utils/http.js";
import {
  hashPassword,
  checkPassword,
  newPasswordProblem,
} from "../utils/password.js";
import { nameProblem } from "../utils/name.js";
import { signToken } from "../utils/jwt.js";
import { sendPasswordChangedEmail } from "../services/mail.service.js";

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

async function passwordMatches(userId, password) {
  const account = await User.findById(userId).select("+passwordHash");
  if (!account) return false;
  return checkPassword(password, account.passwordHash);
}

export async function getProfile(req, res) {
  const user = req.user;
  const [favourites, recentlyViewed, reviews] = await Promise.all([
    Phone.countDocuments({ _id: { $in: user.favourites } }),
    Phone.countDocuments({
      _id: { $in: user.recentlyViewed.map((entry) => entry.phone) },
    }),
    Review.countDocuments({ user: user._id }),
  ]);

  return ok(res, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
      emailVerifiedAt: user.emailVerifiedAt ?? null,
      createdAt: user.createdAt,
      passwordChangedAt: user.passwordChangedAt ?? null,
    },
    counts: {
      favourites,
      recentlyViewed,
      searchHistory: user.searchHistory.length,
      reviews,
    },
  });
}

export async function updateProfile(req, res) {
  const email = req.body?.email;
  if (
    email !== undefined &&
    email !== null &&
    String(email).trim().toLowerCase() !== req.user.email
  )
    throw httpError(400, "Your email cannot be changed");

  const name = String(req.body?.name || "").trim();
  const problem = nameProblem(name);
  if (problem) throw httpError(400, problem);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name } },
    { new: true, runValidators: true },
  );
  await Review.updateMany({ user: user._id }, { $set: { author: name } });
  return ok(res, { user: user.toSafeJSON() });
}

export async function changePassword(req, res) {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");

  if (!currentPassword || !newPassword)
    throw httpError(400, "Enter your current password and a new password");
  const problem = newPasswordProblem(newPassword);
  if (problem) throw httpError(400, problem);
  if (newPassword === currentPassword)
    throw httpError(
      400,
      "Your new password must be different from your current password",
    );
  if (!(await passwordMatches(req.user._id, currentPassword)))
    throw httpError(400, "Your current password is not right");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
      },
      $inc: { tokenVersion: 1 },
    },
    { new: true },
  );

  sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((err) => {
    console.error(`Could not send the password changed email: ${err.message}`);
  });

  return ok(res, { token: signToken(user), user: user.toSafeJSON() });
}

export async function signOutOthers(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { tokenVersion: 1 } },
    { new: true },
  );
  return ok(res, { token: signToken(user), user: user.toSafeJSON() });
}

export async function clearSearchHistory(req, res) {
  await User.updateOne({ _id: req.user._id }, { $set: { searchHistory: [] } });
  return ok(res, { cleared: true });
}

export async function clearRecentlyViewed(req, res) {
  await User.updateOne({ _id: req.user._id }, { $set: { recentlyViewed: [] } });
  return ok(res, { cleared: true });
}

export async function deleteAccount(req, res) {
  const password = String(req.body?.password || "");
  if (!password)
    throw httpError(400, "Enter your password to delete your account");
  if (!(await passwordMatches(req.user._id, password)))
    throw httpError(400, "Your password is not right");

  const userId = req.user._id;
  const reviewedPhones = await Review.distinct("phone", { user: userId });
  await Review.deleteMany({ user: userId });
  if (reviewedPhones.length) {
    await Phone.updateMany(
      { _id: { $in: reviewedPhones }, "reviewSummary.text": { $gt: "" } },
      { $set: { reviewSummary: { text: "", sentiment: "neutral", count: 0 } } },
    );
  }
  await SearchLog.updateMany({ user: userId }, { $unset: { user: 1 } });
  await User.deleteOne({ _id: userId });
  return ok(res, { deleted: true });
}
