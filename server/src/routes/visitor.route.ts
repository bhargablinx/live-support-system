import { Router } from "express";
import { createVisitor } from "../controllers/visitor.controller.js";
import { getVisitorStatus } from "../controllers/presence.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

// Public — visitor self-registration
router.post("/", createVisitor)

// Protected — agents checking visitor presence
router.get("/:visitorId/status", verifyJwt, getVisitorStatus)

export default router;