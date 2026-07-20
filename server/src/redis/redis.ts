import { Redis } from "ioredis";
import "dotenv/config"

// For: caching, sessions, rate limits, presence
export const redis = new Redis(process.env.REDIS_URL as string)

// Dedicated clients for Socket.io pub/sub adapter
export const redisPub = new Redis(process.env.REDIS_URL as string)
export const redisSub = new Redis(process.env.REDIS_URL as string)

redis.on("error", (err) => console.log("Redis client error:", err));
redisPub.on("error", (err) => console.log("Redis Publishing error:", err));
redisSub.on("error", (err) => console.log("Redis Subscribing error:", err));