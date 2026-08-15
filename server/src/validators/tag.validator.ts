import { z } from "zod";

export const createTagSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "Tag name is required" })
            .trim()
            .min(1, "Tag name cannot be empty")
            .max(30, "Tag name must be 30 characters or less"),
        color: z
            .string()
            .trim()
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid 6-digit hex color code (e.g. #6366f1)")
            .optional(),
    }),
});

export const updateTagSchema = z.object({
    params: z.object({
        tagId: z.string().trim().min(1, "Tag ID is required"),
    }),
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, "Tag name cannot be empty")
            .max(30, "Tag name must be 30 characters or less")
            .optional(),
        color: z
            .string()
            .trim()
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid 6-digit hex color code (e.g. #6366f1)")
            .optional(),
    }),
});

export const tagIdParamSchema = z.object({
    params: z.object({
        tagId: z.string().trim().min(1, "Tag ID is required"),
    }),
});

export const addConversationTagSchema = z.object({
    params: z.object({
        id: z.string().trim().min(1, "Conversation ID is required"),
    }),
    body: z.object({
        tagId: z.string().trim().min(1, "Tag ID is required").optional(),
        name: z.string().trim().min(1, "Tag name is required").optional(),
    }).refine((data) => Boolean(data.tagId || data.name), {
        message: "Either tagId or name must be provided",
    }),
});

export const removeConversationTagSchema = z.object({
    params: z.object({
        id: z.string().trim().min(1, "Conversation ID is required"),
        tagId: z.string().trim().min(1, "Tag ID is required"),
    }),
});
