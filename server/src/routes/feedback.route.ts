import { Router } from "express";
import { createFeedback } from "../controllers/feedback.controller.js";
import { visitorLimiter, orgLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", visitorLimiter, orgLimiter, createFeedback);

export default router;
