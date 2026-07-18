import { Router } from "express";
import { 
    createConversation, 
    getConversations, 
    claimConversation, 
    resolveConversation, 
    getMessages 
} from "../controllers/conversation.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", createConversation)
router.get("/", verifyJwt, getConversations)
router.post("/:id/claim", verifyJwt, claimConversation)
router.post("/:id/resolve", verifyJwt, resolveConversation)
router.get("/:id/messages", verifyJwt, getMessages)

export default router;