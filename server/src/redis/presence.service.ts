import { redis } from "./redis.js"
import { RedisKey } from "./redis.key.gen.js"

const PRESENCE_TTL = 60 // 60 seconds TTL

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
    }
}