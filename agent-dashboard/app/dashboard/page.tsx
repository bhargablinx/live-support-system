"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/lib/store/store";
import { ConversationList } from "@/components/dashboard/conversation-list";
import { ChatWindow } from "@/components/dashboard/chat-window";
import { CustomerDetails } from "@/components/dashboard/customer-details";
import { Conversation, Message } from "@/lib/types";
import { useDashboardSocket } from "@/hooks/use-dashboard-socket";
import {
    fetchConversations,
    claimConversation,
    resolveConversation,
    archiveConversation,
    reopenConversation,
    deleteConversation,
} from "@/lib/api/conversation";

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [onlineVisitors, setOnlineVisitors] = useState<string[]>([]);
    // Stores the conversationId where the visitor is currently typing (null = no one typing)
    const [visitorTypingConvoId, setVisitorTypingConvoId] = useState<string | null>(null);

    // Store latest conversations in a ref to avoid stale closures in socket event handlers
    const conversationsRef = useRef<Conversation[]>([]);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    const activeConversation = conversations.find((c) => c.id === selectedId) || null;
    const activeMessages = selectedId ? messages[selectedId] || [] : [];

    // Load initial data — wrapped in useCallback so the reference is stable.
    // Without this, every render creates a new function reference, which triggers
    // the socket useEffect to reconnect (losing conversation room membership).
    const loadConversations = useCallback(async () => {
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
    }, []); // deps are empty: setConversations / setMessages are stable React setters

    // Fetch initial conversations on mount
    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadConversations();
        }
    }, [user, loadConversations]);

    // Setup Socket.io real-time connection and event listeners
    const { sendMessage, sendTypingEvent } = useDashboardSocket({
        conversationsRef,
        setConversations,
        setMessages,
        setOnlineVisitors,
        setVisitorTyping: setVisitorTypingConvoId,
        loadConversations,
        selectedId,
    });

    // True when the visitor in the currently open conversation is typing
    const isVisitorTyping = visitorTypingConvoId === selectedId && selectedId !== null;

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

    // Archive conversation action
    const handleArchive = async () => {
        if (!selectedId) return;
        try {
            const res = await archiveConversation(selectedId);
            if (res.statusCode === 200 && res.data) {
                // Sync state locally
                setConversations((prev) =>
                    prev.map((c) => (c.id === selectedId ? { ...c, ...res.data } : c))
                );
            }
        } catch (error) {
            console.error("Failed to archive conversation:", error);
        }
    };

    // Reopen conversation action
    const handleReopen = async () => {
        if (!selectedId) return;
        try {
            const res = await reopenConversation(selectedId);
            if (res.statusCode === 200 && res.data) {
                // Sync state locally
                setConversations((prev) =>
                    prev.map((c) => (c.id === selectedId ? { ...c, ...res.data } : c))
                );
            }
        } catch (error) {
            console.error("Failed to reopen conversation:", error);
        }
    };

    // Delete conversation action
    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            const res = await deleteConversation(selectedId);
            if (res.statusCode === 200) {
                // Remove from state locally
                setConversations((prev) => prev.filter((c) => c.id !== selectedId));
                setSelectedId(null);
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    };

    return (
        <main className="flex h-full w-full overflow-hidden">
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
                    onSendMessage={sendMessage}
                    onClaim={handleClaim}
                    onDelete={handleDelete}
                    isOnline={activeConversation ? onlineVisitors.includes(activeConversation.visitorId) : false}
                    isVisitorTyping={isVisitorTyping}
                    onTypingChange={sendTypingEvent}
                />
            </div>

            {/* Panel 3: Customer context detail sidebar */}
            <div className="w-80 shrink-0 h-full">
                <CustomerDetails
                    conversation={activeConversation}
                    onResolve={handleResolve}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                    isOnline={activeConversation ? onlineVisitors.includes(activeConversation.visitorId) : false}
                />
            </div>
        </main>
    );
}
