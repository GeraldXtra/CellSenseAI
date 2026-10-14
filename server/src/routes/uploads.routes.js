// uploadsRoutes: the Express router for /api/uploads, the uploaded phone pictures. Owner: Gerald.
import { Router } from "express";
import { getPhonePicture } from "../controllers/uploads.controller.js";

export const uploadsRoutes = Router();

uploadsRoutes.get("/phones/:file", getPhonePicture);
