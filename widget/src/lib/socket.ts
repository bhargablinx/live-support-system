import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

let socket: Socket | null = null

export const getSocket = (visitorToken: string): Socket => {
    if (socket) return socket;

    const socketUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "");

    socket = io(socketUrl, {
        auth: { visitorToken },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        transports: ["websocket", "polling"]
    })

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null;
    }
}