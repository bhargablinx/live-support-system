import { Router } from "express";
import { getAgents, createAgent, deleteAgent, updateProfile } from "../controllers/agent.controller.js";
import { getOnlineAgents } from "../controllers/presence.controller.js";
import { verifyJwt, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

// Presence — any authenticated user can query online agents
router.get("/online", verifyJwt, getOnlineAgents);

// Profile update — any authenticated user can update their display name
router.patch("/profile", verifyJwt, updateProfile);

// All routes below require a valid JWT + ADMIN role
router.use(verifyJwt, authorizeRole("ADMIN"));

router.get("/", getAgents);
router.post("/", createAgent);
router.delete("/:agentId", deleteAgent);

export default router;
