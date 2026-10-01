import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { ok } from "./utils/http.js";
import { authRoutes } from "./routes/auth.routes.js";
import { phonesRoutes } from "./routes/phones.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { usersRoutes } from "./routes/users.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { startPriceUpdater } from "./jobs/priceUpdater.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    message: {
      ok: false,
      error: { message: "Too many requests. Try again in a few minutes." },
    },
  }),
);

app.get("/api/health", (req, res) => ok(res, { status: "up" }));
app.use("/api/auth", authRoutes);
app.use("/api/phones", phonesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", usersRoutes);

app.use(notFound);
app.use(errorHandler);

await connectDB();
startPriceUpdater();

app.listen(env.PORT, () => {
  console.log(`CellSense API running on http://localhost:${env.PORT}`);
});
