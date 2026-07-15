import { io } from "../index.js";
import prisma from "../utils/prisma.js";

io.on("connection", (socket) => {
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
})