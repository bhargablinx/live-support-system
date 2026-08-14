import { z } from "zod";

export const createAgentSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        name: z.string().trim().optional(),
    }),
});

export const updateProfileSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, "Name cannot be empty")
            .max(100, "Name is too long"),
    }),
});
