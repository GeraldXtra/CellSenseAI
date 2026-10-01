// authRoutes: the Express router for /api/auth. Owner: Gerald.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const authRoutes = Router();

const forgotLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    ok: false,
    error: { message: "Too many reset requests. Try again in 15 minutes." },
  },
});

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/forgot-password", forgotLimit, forgotPassword);
authRoutes.post("/reset-password", resetPassword);
