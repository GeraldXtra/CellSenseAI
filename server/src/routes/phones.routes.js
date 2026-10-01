// phonesRoutes: the Express router for /api/phones. Owner: Gerald.
import { Router } from "express";
import {
  listPhones,
  comparePhones,
  getPhone,
  getPriceTrend,
  listReviews,
  addReview,
  getReviewSummary,
} from "../controllers/phones.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

export const phonesRoutes = Router();

phonesRoutes.get("/", listPhones);
phonesRoutes.get("/compare", comparePhones);
phonesRoutes.get("/:slug", optionalAuth, getPhone);
phonesRoutes.get("/:slug/price-trend", getPriceTrend);
phonesRoutes.get("/:slug/reviews", listReviews);
phonesRoutes.post("/:slug/reviews", requireAuth, addReview);
phonesRoutes.get("/:slug/review-summary", getReviewSummary);
