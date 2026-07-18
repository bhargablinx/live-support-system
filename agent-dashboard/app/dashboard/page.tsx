"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store/store";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ConversationList } from "@/components/dashboard/conversation-list";
import { ChatWindow } from "@/components/dashboard/chat-window";
import { CustomerDetails } from "@/components/dashboard/customer-details";
import { Conversation, Message } from "@/lib/types";
import { io, Socket } from "socket.io-client";
import {
    fetchConversations,
    claimConversation,
    resolveConversation,
} from "@/lib/api/conversation";

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Store latest conversations in a ref to avoid stale closures in socket event handlers
    const conversationsRef = useRef<Conversation[]>([]);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    const activeConversation = conversations.find((c) => c.id === selectedId) || null;
    const activeMessages = selectedId ? messages[selectedId] || [] : [];

    // Load initial data
    const loadConversations = async () => {
        try {
            const res = await fetchConversations();
            if (res.statusCode === 200 && res.data) {
                setConversations(res.data);

                // Populate messages state map
                const msgMap: Record<string, Message[]> = {};
                res.data.forEach((c) => {
                    msgMap[c.id] = c.messages || [];
                });
                setMessages(msgMap);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    };

    // Fetch initial conversations on mount
    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadConversations();
        }
    }, [user]);

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

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    // Handle joining chat rooms when selecting chats
    useEffect(() => {
        if (socketRef.current && selectedId) {
            socketRef.current.emit("join_room", { conversationId: selectedId });
        }
    }, [selectedId]);

    // Claim conversation action
    const handleClaim = async () => {
        if (!selectedId) return;
        try {
            const res = await claimConversation(selectedId);
            if (res.statusCode === 200 && res.data) {
                // Sync state locally
                setConversations((prev) =>
                    prev.map((c) => (c.id === selectedId ? { ...c, ...res.data } : c))
                );
            }
        } catch (error) {
            console.error("Failed to claim conversation:", error);
        }
    };

    // Resolve conversation action
    const handleResolve = async () => {
        if (!selectedId) return;
        try {
            const res = await resolveConversation(selectedId);
            if (res.statusCode === 200 && res.data) {
                // Sync state locally
                setConversations((prev) =>
                    prev.map((c) => (c.id === selectedId ? { ...c, ...res.data } : c))
                );
            }
        } catch (error) {
            console.error("Failed to resolve conversation:", error);
        }
    };

    // Send a message via Socket.io
    const handleSendMessage = (content: string) => {
        if (!selectedId || !socketRef.current) return;

        // Emit the message via socket
        socketRef.current.emit("send_message", {
            conversationId: selectedId,
            content,
        });
    };

    return (
        <main className="flex h-screen w-screen overflow-hidden">
            {/* Narrow Left Sidebar */}
            <SidebarNav />

            {/* Panel 1: Conversation list sidebar */}
            <div className="w-80 shrink-0 h-full">
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    messages={messages}
                />
            </div>

            {/* Panel 2: Chat window area */}
            <div className="flex-1 h-full min-w-0">
                <ChatWindow
                    conversation={activeConversation}
                    messages={activeMessages}
                    onSendMessage={handleSendMessage}
                    onClaim={handleClaim}
                />
            </div>

            {/* Panel 3: Customer context detail sidebar */}
            <div className="w-80 shrink-0 h-full">
                <CustomerDetails
                    conversation={activeConversation}
                    onResolve={handleResolve}
                />
            </div>
        </main>
    );
}
