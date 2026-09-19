import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin/no-origin (curl, mobile app) and localhost dev ports.
      if (
        !origin ||
        origin === env.clientUrl ||
        /http:\/\/localhost:\d+$/i.test(origin) ||
        /http:\/\/127\.0\.0\.1:\d+$/i.test(origin)
      ) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ ok: true, service: "nuzio-api", health: "/health" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "nuzio-api", time: new Date().toISOString() });
});

app.use("/api/v1", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
