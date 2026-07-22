import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verifyJwt, getAnalytics);

export default router;
