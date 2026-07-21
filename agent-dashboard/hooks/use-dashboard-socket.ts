import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Conversation, Message } from "@/lib/types";
import { useAppSelector } from "@/lib/store/store";

interface UseDashboardSocketProps {
    conversationsRef: React.MutableRefObject<Conversation[]>;
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
    setOnlineVisitors: React.Dispatch<React.SetStateAction<string[]>>;
    setVisitorTyping: React.Dispatch<React.SetStateAction<string | null>>;
    loadConversations: () => Promise<void>;
    selectedId: string | null;
}

export function useDashboardSocket({
    conversationsRef,
    setConversations,
    setMessages,
    setOnlineVisitors,
    setVisitorTyping,
    loadConversations,
    selectedId,
}: UseDashboardSocketProps) {
    const { user } = useAppSelector((state) => state.auth);
    const socketRef = useRef<Socket | null>(null);
    // Tracks the currently selected conversation so the connect handler can
    // re-join the room after every (re)connection without a stale closure.
    const selectedIdRef = useRef<string | null>(selectedId);
    // Auto-clear timer: mirrors the backend TYPING_TTL of 5s
    const typingClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            // Re-join conversation room on every (re)connection.
            // This is critical: if the socket was recreated the join_room useEffect
            // won't re-fire (selectedId hasn't changed), so we use the ref here.
            if (selectedIdRef.current) {
                socket.emit("join_room", { conversationId: selectedIdRef.current });
            }
        });

        // Listen for new messages / org updates
        socket.on("org_message", ({ conversationId, message }: { conversationId: string; message: Message }) => {
            // Clear typing state when a message arrives from the visitor
            if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
            setVisitorTyping(null);

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

        // Listen for archived chats
        socket.on("conversation_archived", (updatedConvo: Conversation) => {
            setConversations((prev) =>
                prev.map((c) => (c.id === updatedConvo.id ? { ...c, ...updatedConvo } : c))
            );
        });

        // Listen for reopened chats
        socket.on("conversation_reopened", (updatedConvo: Conversation) => {
            setConversations((prev) =>
                prev.map((c) => (c.id === updatedConvo.id ? { ...c, ...updatedConvo } : c))
            );
        });

        // Listen for deleted chats
        socket.on("conversation_deleted", ({ id }: { id: string }) => {
            setConversations((prev) => prev.filter((c) => c.id !== id));
        });

        // Listen for presence
        socket.on("visitor_online", ({ visitorId }: { visitorId: string }) => {
            setOnlineVisitors((prev) => (prev.includes(visitorId) ? prev : [...prev, visitorId]));
        });

        socket.on("visitor_offline", ({ visitorId }: { visitorId: string }) => {
            setOnlineVisitors((prev) => prev.filter((id) => id !== visitorId));
        });

        // Listen for typing indicators — only care about visitor actors
        socket.on("typing_start", ({ actorType, conversationId }: { actorId: string; actorType: string; conversationId: string }) => {
            if (actorType !== "visitor") return;

            setVisitorTyping(conversationId);

            // Safety-net: auto-clear after 5s to match backend TYPING_TTL
            if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
            typingClearTimer.current = setTimeout(() => {
                setVisitorTyping(null);
            }, 5000);
        });

        socket.on("typing_stop", () => {
            if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
            setVisitorTyping(null);
        });

        // Listen for disconnect
        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, setConversations, setMessages, setOnlineVisitors, setVisitorTyping, loadConversations, conversationsRef]);

    // Handle joining chat rooms when selecting chats
    useEffect(() => {
        // Keep the ref current so the connect handler always has the latest id
        selectedIdRef.current = selectedId;
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

    // Emit type_start / type_stop for the currently selected conversation
    const sendTypingEvent = (isTyping: boolean) => {
        if (!selectedId || !socketRef.current) return;
        socketRef.current.emit(isTyping ? "type_start" : "type_stop", {
            conversationId: selectedId,
        });
    };

    return {
        sendMessage,
        sendTypingEvent,
    };
}

