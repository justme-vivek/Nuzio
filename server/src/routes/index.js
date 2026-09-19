import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import preferenceRoutes from "./preference.routes.js";
import voiceRoutes from "./voice.routes.js";
import newsRoutes from "./news.routes.js";
import briefingRoutes from "./briefing.routes.js";
import savedRoutes from "./saved.routes.js";
import notificationRoutes from "./notification.routes.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { search } from "../controllers/news.controller.js";
import { getSubscription } from "../controllers/subscription.controller.js";
import { streamAudio } from "../controllers/audio.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "nuzio-api",
    api: "/api/v1",
    health: "/health",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/preferences", preferenceRoutes);
router.use("/voices", voiceRoutes);
router.use("/news", newsRoutes);
router.get("/search", requireAuth, search);
router.use("/briefings", briefingRoutes);
router.use("/saved", savedRoutes);
router.use("/notifications", notificationRoutes);
router.get("/subscription", requireAuth, getSubscription);
router.get("/audio/:fileId", requireAuth, streamAudio);

export default router;
