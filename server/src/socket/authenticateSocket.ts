import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/verifyToken.js";
import prisma from "../utils/prisma.js";

export async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
    const { token, visitorToken } = socket.handshake.auth;

    if (token) {

        try {
            const payload = await verifyAccessToken(token);
            socket.data.type = 'agent';
            socket.data.userId = payload.id;
            socket.data.organizationId = payload.organizationId;
            return next();
        } catch (error) {
            return next(new Error('Invalid agent token'));
        }

    }

    if (visitorToken) {
        // Visitor connecting
        const visitor = await prisma.visitor.findUnique({ where: { token: visitorToken } });
        if (!visitor) return next(new Error('Invalid visitor token'));
        socket.data.type = 'visitor';
        socket.data.visitorId = visitor.id;
        socket.data.organizationId = visitor.organizationId;
        return next();
    }

    next(new Error('No auth provided'));
}