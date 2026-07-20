import { redis } from "./redis.js"
import { RedisKey } from "./redis.key.gen.js"

const PRESENCE_TTL = 60 // 60 seconds TTL
const TYPING_TTL = 5

export const presenceService = {
    // Visitor
    async setVisitorOnline(visitorId: string, orgId: string) {
        await Promise.all([
            redis.set(RedisKey.visitorPresence(visitorId), orgId, "EX", PRESENCE_TTL),
            redis.sadd(RedisKey.orgOnlineVisitors(orgId), visitorId)
        ])
    },

    async setVisitorOffline(visitorId: string, orgId: string) {
        await Promise.all([
            redis.del(RedisKey.visitorPresence(visitorId)),
            redis.srem(RedisKey.orgOnlineVisitors(orgId), visitorId)
        ])
    },

    async isVisitorOnline(visitorId: string): Promise<boolean> {
        return (await redis.exists(RedisKey.visitorPresence(visitorId))) === 1;
    },



    // Agent
    async setAgentOnline(agentId: string, orgId: string) {
        await Promise.all([
            redis.set(RedisKey.agentPresence(agentId), orgId, "EX", PRESENCE_TTL),
            redis.sadd(RedisKey.orgOnlineAgents(orgId), agentId),
        ]);
    },

    async setAgentOffline(agentId: string, orgId: string) {
        await Promise.all([
            redis.del(RedisKey.agentPresence(agentId)),
            redis.srem(RedisKey.orgOnlineAgents(orgId), agentId),
        ]);
    },

    async getOnlineAgents(orgId: string): Promise<string[]> {
        return redis.smembers(RedisKey.orgOnlineAgents(orgId));
    },

    async heartBeat(actorId: string, type: "visitor" | "agent") {
        const key = type === "visitor"
            ? RedisKey.visitorPresence(actorId)
            : RedisKey.agentPresence(actorId);

        await redis.expire(key, PRESENCE_TTL)
    },

    // Both
    async startTyping(conversationId: string, actorId: string, actorType: "visitor" | "agent") {
        await redis.set(
            RedisKey.typing(conversationId, actorId),
            actorType,   // store the type as the value — useful for the frontend
            "EX",
            TYPING_TTL
        );
    },

    async stopTyping(conversationId: string, actorId: string) {
        await redis.del(RedisKey.typing(conversationId, actorId));
    },

    // Returns all actors currently typing in a conversation
    async getTypingUsers(conversationId: string): Promise<{ actorId: string; actorType: string }[]> {
        // Scan keys matching conversation:<id>:typing:*
        const pattern = `conversation:${conversationId}:typing:*`;
        const keys = await redis.keys(pattern);

        if (keys.length === 0) return [];

        const values = await redis.mget(...keys);

        return keys.map((key, i) => ({
            actorId: key.split(":").at(-1)!,   // last segment is the actorId
            actorType: values[i] ?? "unknown",
        }));
    },
}