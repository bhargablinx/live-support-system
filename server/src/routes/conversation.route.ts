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
import { widgetLimiter, visitorLimiter, userLimiter, orgLimiter } from "../middleware/rateLimiter.js";

const router = Router()

router.post("/", widgetLimiter, orgLimiter, createConversation)
router.get("/", verifyJwt, userLimiter, orgLimiter, getConversations)
router.get("/latest", visitorLimiter, orgLimiter, getLatestConversation)
router.post("/:id/claim", verifyJwt, userLimiter, orgLimiter, claimConversation)
router.post("/:id/resolve", verifyJwt, userLimiter, orgLimiter, resolveConversation)
router.post("/:id/archive", verifyJwt, userLimiter, orgLimiter, archiveConversation)
router.post("/:id/reopen", verifyJwt, userLimiter, orgLimiter, reopenConversation)
router.delete("/:id", verifyJwt, authorizeRole("ADMIN"), userLimiter, orgLimiter, deleteConversation)
router.get("/:id/messages", verifyJwt, userLimiter, orgLimiter, getMessages)
router.get("/:id/visitor-messages", visitorLimiter, orgLimiter, getVisitorMessages)
router.post("/resolved", visitorLimiter, orgLimiter, isConversationResolved)

export default router;