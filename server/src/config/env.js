import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const requiredProductionEnv = [
  "MONGODB_URI",
  "GOOGLE_CLIENT_ID",
  "JWT_SECRET",
  "AI_API_KEY",
  "CLIENT_URL",
];
if (isProd) {
  const missing = requiredProductionEnv.filter((key) => !process.env[key]);
  if (process.env.JWT_SECRET === "nuzio-dev-secret-change-me")
    missing.push("JWT_SECRET (use a unique secret)");
  if (missing.length)
    throw new Error(
      `Missing production environment values: ${missing.join(", ")}`,
    );
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nuzio",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  jwtSecret: process.env.JWT_SECRET || "nuzio-dev-secret-change-me",
  jwtExpiresIn: "7d",
  aiApiKey: process.env.AI_API_KEY || "",
  // Evergreen aliases: Google rotates the concrete model behind them, so the app
  // keeps working when a version is retired for new users (e.g. gemini-2.5-flash).
  aiModel: process.env.AI_MODEL || "gemini-flash-latest",
  aiFallbackModel: process.env.AI_FALLBACK_MODEL || "gemini-flash-lite-latest",
  // Google News RSS is a keyless fallback source used when GDELT rate-limits
  // (its DOC API allows 1 request / 5s and answers 429 on shared/VPN IPs).
  // Set NEWS_RSS_FALLBACK=false to run on GDELT alone.
  newsRssFallback:
    (process.env.NEWS_RSS_FALLBACK || "true").toLowerCase() !== "false",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

export const flags = {
  googleConfigured: () => Boolean(env.googleClientId),
  aiConfigured: () => Boolean(env.aiApiKey),
};
