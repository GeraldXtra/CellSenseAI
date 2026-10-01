// aiRoutes: the Express router for /api/ai. Owner: Gerald.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { optionalAuth } from "../middleware/auth.js";
import { search, chat } from "../controllers/ai.controller.js";

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
aiRoutes.post("/chat", chat);
