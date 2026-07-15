import { Router } from "express";
import { createConversation } from "../controllers/conversation.controller.js";

const router = Router()

router.post("/", createConversation)

export default router;