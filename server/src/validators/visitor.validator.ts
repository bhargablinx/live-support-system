import { z } from "zod";

export const createVisitorSchema = z.object({
    body: z.object({
        organizationId: z
            .string()
            .trim()
            .min(1, "Organization id is required"),
        name: z
            .string()
            .trim()
            .min(1, "Name is required"),
        email: z
            .string()
            .trim()
            .email("Invalid email address"),
        currentUrl: z.string().trim().optional(),
    }),
});
