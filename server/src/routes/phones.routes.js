// phonesRoutes: the Express router for /api/phones. Owner: Gerald.
import { Router } from "express";
import { getPhone, listPhones } from "../controllers/phones.controller.js";

export const phonesRoutes = Router();

phonesRoutes.get("/", listPhones);
phonesRoutes.get("/:slug", getPhone);
