import { redis } from "./redis.js"
import { RedisKey } from "./redis.key.gen.js"

const SOCKET_TTL = 3600;

export type SocketIdentity = {
    type: "agent" | "visitor";
    actorId: string;
    organizationId: string;
}

export const socketMapService = {

    async register(socketId: string, identity: SocketIdentity): Promise<void> {
        // Use a pipeline so SADD and EXPIRE are sent in one round-trip and in order,
        // avoiding the race where EXPIRE runs before SADD has persisted the key.
        const pipeline = redis.pipeline();

        // Forward: socket → who is it?
        pipeline.set(
            RedisKey.socketIdentity(socketId),
            JSON.stringify(identity),
            "EX",
            SOCKET_TTL
        );

        // Reverse: user → which sockets do they have open?
        pipeline.sadd(RedisKey.userSockets(identity.actorId), socketId);
        pipeline.expire(RedisKey.userSockets(identity.actorId), SOCKET_TTL);

        await pipeline.exec();
    },

    async unregister(socketId: string): Promise<void> {
        const raw = await redis.get(RedisKey.socketIdentity(socketId));
        if (!raw) return;

        const identity: SocketIdentity = JSON.parse(raw);

        await Promise.all([
            redis.del(RedisKey.socketIdentity(socketId)),
            redis.srem(RedisKey.userSockets(identity.actorId), socketId),
        ]);
    },

    async getIdentity(socketId: string): Promise<SocketIdentity | null> {
        const raw = await redis.get(RedisKey.socketIdentity(socketId));
        return raw ? (JSON.parse(raw) as SocketIdentity) : null;
    },

    async getSocketIds(actorId: string): Promise<string[]> {
        return redis.smembers(RedisKey.userSockets(actorId));
    },

    async isConnected(actorId: string): Promise<boolean> {
        const count = await redis.scard(RedisKey.userSockets(actorId));
        return count > 0;
    },
}