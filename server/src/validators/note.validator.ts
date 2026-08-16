import { z } from "zod";

export const createNoteSchema = z.object({
    params: z.object({
        id: z.string().trim().min(1, "Conversation ID is required"),
    }),
    body: z.object({
        content: z
            .string({ message: "Note content is required" })
            .trim()
            .min(1, "Note content cannot be empty")
            .max(2000, "Note content must be 2000 characters or less"),
    }),
});

export const updateNoteSchema = z.object({
    params: z.object({
        id: z.string().trim().min(1, "Conversation ID is required"),
        noteId: z.string().trim().min(1, "Note ID is required"),
    }),
    body: z.object({
        content: z
            .string({ message: "Note content is required" })
            .trim()
            .min(1, "Note content cannot be empty")
            .max(2000, "Note content must be 2000 characters or less"),
    }),
});

export const noteIdParamSchema = z.object({
    params: z.object({
        id: z.string().trim().min(1, "Conversation ID is required"),
        noteId: z.string().trim().min(1, "Note ID is required"),
    }),
});
