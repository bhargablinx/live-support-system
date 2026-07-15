import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma.js";
import { authenticateSocket } from './authenticateSocket.js';

export function registerSocketHandlers(io: Server) {
    io.use(authenticateSocket);

    io.on("connection", (socket: Socket) => {
        console.log(`Socket connected: ${socket.id} (${socket.data.type})`);

        socket.on("join_room", ({ conversationId }: { conversationId: string }) => {
            socket.join(conversationId)
            console.log(`User joined room: ${conversationId}`)
            socket.emit("room_joined", { conversationId });
        });

        socket.on("send_message", async ({ conversationId, content }) => {
            const senderType = socket.data.type === "agent" ? "AGENT" : "VISITOR";

            const message = await prisma.message.create({
                data: { conversationId, content, senderType },
            });

            socket.to(conversationId).emit('receive_message', message);
            socket.emit('receive_message', message);
        })

        // presence cleanup comes here (Redis implementation)

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    })
}