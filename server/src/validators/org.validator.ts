import { z } from "zod";

export const updateOrgSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Organization name must be at least 2 characters"),
    }),
});
