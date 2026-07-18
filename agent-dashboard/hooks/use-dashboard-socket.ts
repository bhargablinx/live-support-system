import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Conversation, Message } from "@/lib/types";
import { useAppSelector } from "@/lib/store/store";

interface UseDashboardSocketProps {
    conversationsRef: React.MutableRefObject<Conversation[]>;
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
    loadConversations: () => Promise<void>;
    selectedId: string | null;
}

export function useDashboardSocket({
    conversationsRef,
    setConversations,
    setMessages,
    loadConversations,
    selectedId,
}: UseDashboardSocketProps) {
    const { user } = useAppSelector((state) => state.auth);
    const socketRef = useRef<Socket | null>(null);

    // Setup Socket.io real-time connection
    useEffect(() => {
        if (!user) return;

        // Connect directly to the backend socket server
        const socket = io("http://localhost:8000", {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket connected to server:", socket.id);
        });

        // Listen for new messages / org updates
        socket.on("org_message", ({ conversationId, message }: { conversationId: string; message: Message }) => {
            // Append message to state map
            setMessages((prev) => {
                const list = prev[conversationId] || [];
                if (list.some((m) => m.id === message.id)) return prev;
                return {
                    ...prev,
                    [conversationId]: [...list, message],
                };
            });

            // Update conversation updatedAt / last message in list
            if (!conversationsRef.current.some((c) => c.id === conversationId)) {
                // If conversation doesn't exist, fetch latest list (safe here since it's an async event callback, not in the render path)
                loadConversations();
            } else {
                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === conversationId
                            ? {
                                ...c,
                                updatedAt: message.createdAt,
                            }
                            : c
                    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );
            }
        });

        // Listen for other agents claiming chats
        socket.on("conversation_claimed", (updatedConvo: Conversation) => {
            setConversations((prev) =>
                prev.map((c) => (c.id === updatedConvo.id ? { ...c, ...updatedConvo } : c))
            );
        });

        // Listen for resolved chats
        socket.on("conversation_resolved", (updatedConvo: Conversation) => {
            setConversations((prev) =>
                prev.map((c) => (c.id === updatedConvo.id ? { ...c, ...updatedConvo } : c))
            );
        });

        // Listen for disconnect
        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, setConversations, setMessages, loadConversations, conversationsRef]);

    // Handle joining chat rooms when selecting chats
    useEffect(() => {
        if (socketRef.current && selectedId) {
            socketRef.current.emit("join_room", { conversationId: selectedId });
        }
    }, [selectedId]);

    // Send a message via Socket.io
    const sendMessage = (content: string) => {
        if (!selectedId || !socketRef.current) return;

        // Emit the message via socket
        socketRef.current.emit("send_message", {
            conversationId: selectedId,
            content,
        });
    };

    return {
        sendMessage,
    };
}
