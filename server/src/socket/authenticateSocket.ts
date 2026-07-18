import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/verifyToken.js";
import prisma from "../utils/prisma.js";

export async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
    const { visitorToken } = socket.handshake.auth;

    if (visitorToken) {
        // Visitor connecting
        const visitor = await prisma.visitor.findUnique({ where: { token: visitorToken } });
        if (!visitor) return next(new Error('Invalid visitor token'));
        socket.data.type = 'visitor';
        socket.data.visitorId = visitor.id;
        socket.data.organizationId = visitor.organizationId;
        return next();
    }

    let token = socket.handshake.auth.token;

    // Fallback to cookie extraction
    if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(";").reduce((acc, cookie) => {
            const [key, val] = cookie.trim().split("=");
            if (key && val) {
                acc[key] = val;
            }
            return acc;
        }, {} as Record<string, string>);
        token = cookies["accessToken"];
    }

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

    next(new Error('No auth provided'));
}