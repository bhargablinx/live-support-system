import { z } from "zod";

export const submitFeedbackSchema = z.object({
    body: z.object({
        conversationId: z
            .string()
            .trim()
            .min(1, "Conversation ID is required"),
        visitorToken: z
            .string()
            .trim()
            .min(1, "Visitor token is required"),
        rating: z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be between 1 and 5")
            .max(5, "Rating must be between 1 and 5"),
        comment: z.string().trim().optional(),
    }),
});
