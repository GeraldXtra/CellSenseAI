// aiRoutes: the Express router for /api/ai. Owner: Gerald.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { search } from "../controllers/ai.controller.js";
import { optionalAuth } from "../middleware/auth.js";

export const aiRoutes = Router();

aiRoutes.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    message: {
      ok: false,
      error: {
        message: "Too many questions at once. Wait a minute and try again.",
      },
    },
  }),
);

aiRoutes.post("/search", optionalAuth, search);
