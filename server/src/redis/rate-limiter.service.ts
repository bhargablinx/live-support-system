import { redis } from "./redis.js";

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Checks rate limiting for a given key using Redis sliding window log.
 * @param key The Redis key to use.
 * @param limit Max allowed requests within the window.
 * @param windowMs Window duration in milliseconds.
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    const multi = redis.multi();
    // Remove items older than the start of the window
    multi.zremrangebyscore(key, 0, windowStart);
    // Add current request
    const uniqueMember = `${now}:${Math.random().toString(36).substring(2, 9)}`;
    multi.zadd(key, now, uniqueMember);
    // Get total count in window
    multi.zcard(key);
    // Refresh TTL for the ZSET
    multi.expire(key, Math.ceil(windowMs / 1000) + 2);

    const results = await multi.exec();
    if (!results) {
        throw new Error("Redis rate limiter transaction failed");
    }

    const countResult = results[2];
    if (!countResult || countResult[1] === undefined) {
        throw new Error("Redis rate limiter transaction failed to return count");
    }
    const count = countResult[1] as number;
    const remaining = Math.max(0, limit - count);

    return {
        success: count <= limit,
        limit,
        remaining,
        reset: now + windowMs,
    };
}
