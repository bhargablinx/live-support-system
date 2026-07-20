import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma.js";
import { authenticateSocket } from './authenticateSocket.js';
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { redis } from "../redis/redis.js"
import { presenceService } from "../redis/presence.service.js";

export function registerSocketHandlers(io: Server) {
    io.use(authenticateSocket);

    // Use Redis Streams adapter
    io.adapter(createAdapter(redis));

    io.on("connection", async (socket: Socket) => {
        console.log(`Socket connected: ${socket.id} (${socket.data.type})`);

        const { organizationId, type, visitorId, userId } = socket.data;

        // Join organization room to receive broadcasts
        if (organizationId) {
            socket.join(`org_${organizationId}`);
            console.log(`Joined organization room: org_${organizationId}`);
        }

        // ── Presence: mark online & start heartbeat ──────────────────────────
        if (organizationId) {
            if (type === 'visitor' && visitorId) {
                await presenceService.setVisitorOnline(visitorId, organizationId);
                io.to(`org_${organizationId}`).emit("visitor_online", { visitorId });
            } else if (type === 'agent' && userId) {
                await presenceService.setAgentOnline(userId, organizationId);
            }
        }

        // Refresh Redis TTL every 30s while the socket stays open
        const heartbeatInterval = setInterval(async () => {
            if (type === 'visitor' && visitorId) {
                await presenceService.heartBeat(visitorId, 'visitor');
            } else if (type === 'agent' && userId) {
                await presenceService.heartBeat(userId, 'agent');
            }
        }, 30_000);

        socket.on("join_room", ({ conversationId }: { conversationId: string }) => {
            socket.join(conversationId)
            console.log(`User joined room: ${conversationId}`)
            socket.emit("room_joined", { conversationId });
        });

        socket.on("type_start", async ({ conversationId }: { conversationId: string }) => {
            const actorId = type === "visitor" ? visitorId : userId;
            if (!actorId || !conversationId) return;

            await presenceService.startTyping(conversationId, actorId, type);

            // Broadcast to the conversation room (excluding the sender)
            socket.to(conversationId).emit("typing_start", {
                actorId,
                actorType: type,
                conversationId,
            })
        });

        socket.on("type_stop", async ({ conversationId }: { conversationId: string }) => {
            const actorId = type === "visitor" ? visitorId : userId;
            if (!actorId || !conversationId) return;

            await presenceService.stopTyping(conversationId, actorId);

            socket.to(conversationId).emit("typing_stop", {
                actorId,
                conversationId,
            })
        })

        socket.on("send_message", async ({ conversationId, content }) => {
            const senderType = socket.data.type === "agent" ? "AGENT" : "VISITOR";
            const actorId = type === "visitor" ? visitorId : userId;

            // Clear typing state when message is sent
            if (actorId) await presenceService.stopTyping(conversationId, actorId);

            // Create message and update conversation timestamp
            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: { conversationId, content, senderType },
                }),
                prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
                })
            ]);

            // Broadcast to the conversation room
            socket.to(conversationId).emit('receive_message', message);
            socket.emit('receive_message', message);

            // Broadcast to organization room so agents see new messages / conversation list updates
            if (socket.data.organizationId) {
                io.to(`org_${socket.data.organizationId}`).emit("org_message", {
                    conversationId,
                    message
                });
            }
        })

        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);

            // Stop heartbeat
            clearInterval(heartbeatInterval);

            // ── Presence: mark offline & notify org ──────────────────────────
            if (organizationId) {
                if (type === 'visitor' && visitorId) {
                    await presenceService.setVisitorOffline(visitorId, organizationId);
                    io.to(`org_${organizationId}`).emit("visitor_offline", { visitorId });
                } else if (type === 'agent' && userId) {
                    await presenceService.setAgentOffline(userId, organizationId);
                }
            }
        });
    })
}