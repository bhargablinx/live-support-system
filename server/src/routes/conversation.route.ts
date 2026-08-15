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
import { addTagToConversation, removeTagFromConversation } from "../controllers/tag.controller.js";
import { verifyJwt, authorizeRole } from "../middleware/auth.middleware.js";
import { widgetLimiter, visitorLimiter, userLimiter, orgLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createConversationSchema,
    getLatestConversationSchema,
    conversationIdParamSchema
} from "../validators/conversation.validator.js";
import {
    addConversationTagSchema,
    removeConversationTagSchema
} from "../validators/tag.validator.js";

const router = Router();

router.post("/", widgetLimiter, orgLimiter, validate(createConversationSchema), createConversation);
router.get("/", verifyJwt, userLimiter, orgLimiter, getConversations);
router.get("/latest", visitorLimiter, orgLimiter, validate(getLatestConversationSchema), getLatestConversation);
router.post("/:id/claim", verifyJwt, userLimiter, orgLimiter, validate(conversationIdParamSchema), claimConversation);
router.post("/:id/resolve", verifyJwt, userLimiter, orgLimiter, validate(conversationIdParamSchema), resolveConversation);
router.post("/:id/archive", verifyJwt, userLimiter, orgLimiter, validate(conversationIdParamSchema), archiveConversation);
router.post("/:id/reopen", verifyJwt, userLimiter, orgLimiter, validate(conversationIdParamSchema), reopenConversation);
router.delete("/:id", verifyJwt, authorizeRole("ADMIN"), userLimiter, orgLimiter, validate(conversationIdParamSchema), deleteConversation);
router.get("/:id/messages", verifyJwt, userLimiter, orgLimiter, validate(conversationIdParamSchema), getMessages);
router.get("/:id/visitor-messages", visitorLimiter, orgLimiter, validate(conversationIdParamSchema), getVisitorMessages);
router.post("/resolved", visitorLimiter, orgLimiter, isConversationResolved);
router.post("/:id/tags", verifyJwt, userLimiter, orgLimiter, validate(addConversationTagSchema), addTagToConversation);
router.delete("/:id/tags/:tagId", verifyJwt, userLimiter, orgLimiter, validate(removeConversationTagSchema), removeTagFromConversation);

export default router;