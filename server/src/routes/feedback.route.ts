import { Router } from "express";
import { createFeedback } from "../controllers/feedback.controller.js";
import { visitorLimiter, orgLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import { submitFeedbackSchema } from "../validators/feedback.validator.js";

const router = Router();

router.post("/", visitorLimiter, orgLimiter, validate(submitFeedbackSchema), createFeedback);

export default router;
