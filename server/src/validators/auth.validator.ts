import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        organizationName: z
            .string()
            .trim()
            .min(2, "Organization name must be at least 2 characters"),
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

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .email("Invalid email address"),
        password: z
            .string()
            .min(1, "Password is required"),
    }),
});
