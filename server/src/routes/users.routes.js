// usersRoutes: the Express router for /api/users. Owner: Gerald.
import { Router } from "express";
import {
  getDashboard,
  addFavourite,
  removeFavourite,
} from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const usersRoutes = Router();

usersRoutes.use(requireAuth);

usersRoutes.get("/me/dashboard", getDashboard);
usersRoutes.post("/me/favourites/:slug", addFavourite);
usersRoutes.delete("/me/favourites/:slug", removeFavourite);
