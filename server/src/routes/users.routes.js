// usersRoutes: the Express router for /api/users. Owner: Gerald.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getDashboard,
  addFavourite,
  removeFavourite,
  getProfile,
  updateProfile,
  changePassword,
  signOutOthers,
  clearSearchHistory,
  clearRecentlyViewed,
  deleteAccount,
} from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const usersRoutes = Router();

const accountLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    ok: false,
    error: { message: "Too many tries. Try again in 15 minutes." },
  },
});

usersRoutes.use(requireAuth);

usersRoutes.get("/me/dashboard", getDashboard);
usersRoutes.post("/me/favourites/:slug", addFavourite);
usersRoutes.delete("/me/favourites/:slug", removeFavourite);
usersRoutes.get("/me/profile", getProfile);
usersRoutes.patch("/me/profile", updateProfile);
usersRoutes.patch("/me/password", accountLimit, changePassword);
usersRoutes.post("/me/sign-out-others", accountLimit, signOutOthers);
usersRoutes.delete("/me/search-history", clearSearchHistory);
usersRoutes.delete("/me/recently-viewed", clearRecentlyViewed);
usersRoutes.delete("/me", accountLimit, deleteAccount);
