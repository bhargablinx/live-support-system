"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store/store";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
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
} from "@/lib/api/conversation";

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    // Setup Socket.io real-time connection and event listeners
    const { sendMessage } = useDashboardSocket({
        conversationsRef,
        setConversations,
        setMessages,
        loadConversations,
        selectedId,
    });

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
                    onSendMessage={sendMessage}
                    onClaim={handleClaim}
                />
            </div>

            {/* Panel 3: Customer context detail sidebar */}
            <div className="w-80 shrink-0 h-full">
                <CustomerDetails
                    conversation={activeConversation}
                    onResolve={handleResolve}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                />
            </div>
        </main>
    );
}
