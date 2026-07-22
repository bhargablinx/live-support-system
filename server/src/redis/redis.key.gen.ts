// Centralized Redis key factory for the live-support-system.
// All keys follow the pattern:
//    <namespace>:<entity>:<id>[:<sub-key>]

export const RedisKey = {
    // Auth / Sessions
    refreshToken: (userId: string) => `auth:refresh_token:${userId}`,

    // Presence
    visitorPresence: (visitorId: string) => `presence:visitor:${visitorId}`,
    orgOnlineVisitors: (orgId: string) => `presence:org:${orgId}:visitors`,
    agentPresence: (agentId: string) => `presence:agent:${agentId}`,
    orgOnlineAgents: (orgId: string) => `presence:org:${orgId}:agents`,

    // Conversations
    // Cached conversation metadata
    conversation: (conversationId: string) => `conversation:${conversationId}`,

    // Typing indicator for a participant in a conversation
    typing: (conversationId: string, userId: string) =>
        `conversation:${conversationId}:typing:${userId}`,

    // Rate Limiting
    // Per-IP or per-user rate-limit counter for a given action
    rateLimit: (action: string, identifier: string) =>
        `rate_limit:${action}:${identifier}`,

    // Organizations
    // Cached organization settings / config
    orgConfig: (orgId: string) => `org:${orgId}:config`,

    // Scaling across multiple server instances
    // Forward lookup: socket ID → identity
    socketIdentity: (socketId: string) => `socket:identity:${socketId}`,

    // Reverse lookup: user/visitor → their active socket IDs (a Set, for multi-tab support)
    userSockets: (actorId: string) => `socket:sockets:${actorId}`,
} as const;
