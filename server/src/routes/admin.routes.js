// adminRoutes: the Express router for /api/admin. Owner: Gerald.
import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { httpError } from "../utils/http.js";
import {
  listPhones,
  getPhone,
  createPhone,
  updatePhone,
  uploadPicture,
  recordPriceList,
} from "../controllers/admin.controller.js";

export const adminRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(req, file, done) {
    if (file.mimetype === "image/png") done(null, true);
    else done(httpError(400, "Upload a PNG picture"));
  },
});

function readPicture(req, res, next) {
  upload.single("picture")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return next(
        httpError(
          400,
          err.code === "LIMIT_FILE_SIZE"
            ? "Keep the picture under 2 MB"
            : "Upload a PNG picture",
        ),
      );
    }
    next(err);
  });
}

adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get("/phones", listPhones);
adminRoutes.post("/phones", createPhone);
adminRoutes.get("/phones/:slug", getPhone);
adminRoutes.patch("/phones/:slug", updatePhone);
adminRoutes.post("/phones/:slug/picture", readPicture, uploadPicture);
adminRoutes.post("/prices", recordPriceList);
