import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma.js";
import { authenticateSocket } from './authenticateSocket.js';

export function registerSocketHandlers(io: Server) {
    io.use(authenticateSocket);

    io.on("connection", (socket: Socket) => {
        console.log(`Socket connected: ${socket.id} (${socket.data.type})`);

        // Join organization room to receive broadcasts
        if (socket.data.organizationId) {
            socket.join(`org_${socket.data.organizationId}`);
            console.log(`Joined organization room: org_${socket.data.organizationId}`);
            
            // If it's a visitor, announce online presence
            if (socket.data.type === 'visitor' && socket.data.visitorId) {
                io.to(`org_${socket.data.organizationId}`).emit("visitor_online", { visitorId: socket.data.visitorId });
            }
        }

        socket.on("join_room", ({ conversationId }: { conversationId: string }) => {
            socket.join(conversationId)
            console.log(`User joined room: ${conversationId}`)
            socket.emit("room_joined", { conversationId });
        });

        socket.on("send_message", async ({ conversationId, content }) => {
            const senderType = socket.data.type === "agent" ? "AGENT" : "VISITOR";

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

        // presence cleanup comes here (Redis implementation)

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            
            // Announce visitor offline presence
            if (socket.data.organizationId && socket.data.type === 'visitor' && socket.data.visitorId) {
                io.to(`org_${socket.data.organizationId}`).emit("visitor_offline", { visitorId: socket.data.visitorId });
            }
        });
    })
}