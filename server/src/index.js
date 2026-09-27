import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { connectDB } from "./config/db.js";
import { ok } from "./utils/http.js";
import { authRoutes } from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/health", (req, res) => ok(res, { status: "up" }));
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

await connectDB();

app.listen(env.PORT, () => {
  console.log(`CellSense API running on http://localhost/${env.PORT}`);
});
