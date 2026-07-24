import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { checkRateLimit } from "../redis/rate-limiter.service.js";
import prisma from "../utils/prisma.js";
import { redis } from "../redis/redis.js";

export interface RateLimiterOptions {
    keyPrefix: string;
    limit: number | ((req: Request) => number);
    windowMs: number;
    keyGenerator: (req: Request) => string | null | Promise<string | null>;
    message?: string;
    statusCode?: number;
    skip?: (req: Request) => boolean;
}

/**
 * Helper to extract client IP address.
 */
export const getClientIp = (req: Request): string => {
    const xForwardedFor = req.headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string") {
        const parts = xForwardedFor.split(",");
        const firstPart = parts[0];
        if (firstPart) {
            return firstPart.trim();
        }
    }
    return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

/**
 * Helper to extract visitor token from headers, body, or query.
 */
export const getVisitorToken = (req: Request): string | null => {
    return (
        (req.query.visitorToken as string) ||
        (req.body.visitorToken as string) ||
        (req.headers["x-visitor-token"] as string) ||
        null
    );
};

/**
 * Helper to resolve organization ID for a request.
 */
export const getOrganizationId = async (req: Request): Promise<string | null> => {
    if (req.user?.organizationId) {
        return req.user.organizationId;
    }
    const orgId = req.body.organizationId || req.query.organizationId;
    if (orgId && typeof orgId === "string") {
        return orgId;
    }
    const token = getVisitorToken(req);
    if (token) {
        const cacheKey = `v2o:${token}`;
        let cachedOrgId = await redis.get(cacheKey);
        if (!cachedOrgId) {
            const visitor = await prisma.visitor.findUnique({
                where: { token },
                select: { organizationId: true },
            });
            cachedOrgId = visitor?.organizationId || null;
            if (cachedOrgId) {
                await redis.set(cacheKey, cachedOrgId, "EX", 3600); // cache for 1 hour
            }
        }
        return cachedOrgId;
    }
    return null;
};

/**
 * General-purpose Express Rate Limiting Middleware.
 */
export function rateLimiter(options: RateLimiterOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (options.skip && options.skip(req)) {
                return next();
            }

            const keySuffix = await options.keyGenerator(req);
            if (!keySuffix) {
                return next();
            }

            const key = `rl:${options.keyPrefix}:${keySuffix}`;
            const limit = typeof options.limit === "function" ? options.limit(req) : options.limit;

            const result = await checkRateLimit(key, limit, options.windowMs);

            res.setHeader("X-RateLimit-Limit", result.limit);
            res.setHeader("X-RateLimit-Remaining", result.remaining);
            res.setHeader("X-RateLimit-Reset", Math.ceil(result.reset / 1000));

            if (!result.success) {
                throw new ApiError({
                    statusCode: options.statusCode || 429,
                    message: options.message || "Too many requests, please try again later.",
                    error: "Too Many Requests",
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

// 1. Global API rate limiting
export const globalLimiter = rateLimiter({
    keyPrefix: "global",
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req) => getClientIp(req),
});

// 2. Authentication endpoint limits (Login / Register)
export const authLimiter = rateLimiter({
    keyPrefix: "auth",
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => getClientIp(req),
    message: "Too many authentication attempts. Please try again after 15 minutes.",
});

// 3. Widget/visitor API limits
export const widgetLimiter = rateLimiter({
    keyPrefix: "widget",
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req) => {
        const token = getVisitorToken(req);
        return token ? `token:${token}` : `ip:${getClientIp(req)}`;
    },
    message: "Too many widget requests. Please try again later.",
});

// 5. Organization-specific limits
export const orgLimiter = rateLimiter({
    keyPrefix: "org",
    limit: 1000,
    windowMs: 5 * 60 * 1000, // 5 minutes
    keyGenerator: (req) => getOrganizationId(req),
    message: "Organization API rate limit exceeded.",
});

// 6. IP-based rate limiting (direct/dedicated IP limiter if needed)
export const ipLimiter = rateLimiter({
    keyPrefix: "ip",
    limit: 150,
    windowMs: 60 * 1000,
    keyGenerator: (req) => getClientIp(req),
});

// 7. Visitor token rate limiting
export const visitorLimiter = rateLimiter({
    keyPrefix: "visitor",
    limit: 60,
    windowMs: 60 * 1000,
    keyGenerator: (req) => getVisitorToken(req),
    message: "Visitor API rate limit exceeded.",
});

// 8. User account rate limiting
export const userLimiter = rateLimiter({
    keyPrefix: "user",
    limit: 200,
    windowMs: 60 * 1000,
    keyGenerator: (req) => req.user?.id || null,
    message: "User account API rate limit exceeded.",
});
