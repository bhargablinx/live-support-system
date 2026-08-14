import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validate(schema: ZodTypeAny) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = (await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            })) as { body?: unknown; query?: Record<string, unknown>; params?: Record<string, unknown> };

            if (parsed.body) req.body = parsed.body;
            if (parsed.query) Object.assign(req.query, parsed.query);
            if (parsed.params) Object.assign(req.params, parsed.params);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues
                    .map((issue) => {
                        const path = issue.path.join(".");
                        return path ? `${path}: ${issue.message}` : issue.message;
                    })
                    .join("; ");

                return next(
                    new ApiError({
                        statusCode: 400,
                        message: message || "Validation failed",
                        error: "Bad Request",
                    })
                );
            }
            next(error);
        }
    };
}
