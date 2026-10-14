// authRoutes: the Express router for /api/auth. Owner: Gerald.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  verifyEmail,
  resendCode,
  login,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const authRoutes = Router();

const registerLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    ok: false,
    error: { message: "Too many sign up attempts. Try again in 15 minutes." },
  },
});

const verifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    ok: false,
    error: { message: "Too many tries. Try again in 15 minutes." },
  },
});

const resendLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    ok: false,
    error: {
      message: "Too many new codes asked for. Try again in 15 minutes.",
    },
  },
});

const forgotLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    ok: false,
    error: { message: "Too many reset requests. Try again in 15 minutes." },
  },
});

authRoutes.post("/register", registerLimit, register);
authRoutes.post("/verify-email", verifyLimit, verifyEmail);
authRoutes.post("/resend-code", resendLimit, resendCode);
authRoutes.post("/login", login);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/forgot-password", forgotLimit, forgotPassword);
authRoutes.post("/reset-password", resetPassword);
