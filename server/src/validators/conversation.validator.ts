import { z } from "zod";

export const createConversationSchema = z.object({
    body: z.object({
        organizationId: z
            .string()
            .trim()
            .min(1, "Organization id is required"),
        visitorToken: z
            .string()
            .trim()
            .min(1, "Visitor token is required"),
    }),
});

export const getLatestConversationSchema = z.object({
    query: z.object({
        visitorToken: z
            .string()
            .trim()
            .min(1, "visitorToken query param is required"),
    }),
});

export const conversationIdParamSchema = z.object({
    params: z.object({
        id: z
            .string()
            .trim()
            .min(1, "Conversation ID is required"),
    }),
});

export const assignConversationSchema = z.object({
    params: z.object({
        id: z.string().trim().min(1, "Conversation ID is required"),
    }),
    body: z.object({
        agentId: z.string().trim().min(1, "Target agent ID is required"),
    }),
});

