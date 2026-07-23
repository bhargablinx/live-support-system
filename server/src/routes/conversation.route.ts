import { Router } from "express";
import {
    createConversation,
    getConversations,
    claimConversation,
    resolveConversation,
    getMessages,
    getVisitorMessages,
    archiveConversation,
    reopenConversation,
    deleteConversation,
    isConversationResolved,
    getLatestConversation
} from "../controllers/conversation.controller.js";
import { verifyJwt, authorizeRole } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", createConversation)
router.get("/", verifyJwt, getConversations)
router.get("/latest", getLatestConversation)
router.post("/:id/claim", verifyJwt, claimConversation)
router.post("/:id/resolve", verifyJwt, resolveConversation)
router.post("/:id/archive", verifyJwt, archiveConversation)
router.post("/:id/reopen", verifyJwt, reopenConversation)
router.delete("/:id", verifyJwt, authorizeRole("ADMIN"), deleteConversation)
router.get("/:id/messages", verifyJwt, getMessages)
router.get("/:id/visitor-messages", getVisitorMessages)
router.post("/resolved", isConversationResolved)

export default router;