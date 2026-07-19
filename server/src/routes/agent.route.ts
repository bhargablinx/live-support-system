import { Router } from "express";
import { getAgents, createAgent, deleteAgent } from "../controllers/agent.controller.js";
import { verifyJwt, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require a valid JWT + ADMIN role
router.use(verifyJwt, authorizeRole("ADMIN"));

router.get("/", getAgents);
router.post("/", createAgent);
router.delete("/:agentId", deleteAgent);

export default router;
