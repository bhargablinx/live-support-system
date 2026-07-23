import { Router } from "express";
import { getOrganization, updateOrganization, deleteOrganization } from "../controllers/org.controller.js";
import { verifyJwt, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

// GET organization details (any authenticated agent/admin)
router.get("/", verifyJwt, getOrganization);

// PATCH/DELETE organization details (ADMIN only)
router.patch("/", verifyJwt, authorizeRole("ADMIN"), updateOrganization);
router.delete("/", verifyJwt, authorizeRole("ADMIN"), deleteOrganization);

export default router;
