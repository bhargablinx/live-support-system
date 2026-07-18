"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/store/store";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ConversationList } from "@/components/dashboard/conversation-list";
import { ChatWindow } from "@/components/dashboard/chat-window";
import { CustomerDetails } from "@/components/dashboard/customer-details";
import { mockConversations, mockMessages } from "@/lib/mock";
import { Conversation, Message } from "@/lib/types";

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const activeConversation = conversations.find((c) => c.id === selectedId) || null;
    const activeMessages = selectedId ? messages[selectedId] || [] : [];

    // Claim conversation
    const handleClaim = () => {
        if (!selectedId || !user) return;

        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId
                    ? {
                        ...c,
                        assignedUserId: user.id,
                        status: "CLAIMED",
                    }
                    : c
            )
        );

        // Add system message
        const systemMessage: Message = {
            id: `sys-${Date.now()}`,
            conversationId: selectedId,
            content: `Conversation claimed by ${user.email}`,
            senderType: "AGENT", // System messages styled under agent/info
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), systemMessage],
        }));
    };

    // Resolve conversation
    const handleResolve = () => {
        if (!selectedId) return;

        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedId
                    ? {
                        ...c,
                        status: "RESOLVED",
                    }
                    : c
            )
        );

        // Add system message
        const systemMessage: Message = {
            id: `sys-${Date.now()}`,
            conversationId: selectedId,
            content: "Conversation marked as resolved",
            senderType: "AGENT",
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), systemMessage],
        }));
    };

    // Send a message
    const handleSendMessage = (content: string) => {
        if (!selectedId || !user) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            conversationId: selectedId,
            content,
            senderType: "AGENT",
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), newMessage],
        }));

        // Mock a visitor reply after 2.5 seconds for visual interactive wow effect!
        setTimeout(() => {
            const visitorReplies = [
                "That sounds good. Thank you!",
                "Okay, I'll take a look at that link now.",
                "Wait, is there any discount code I can use?",
                "Got it. Let me try refreshing the page.",
            ];
            const randomReply = visitorReplies[Math.floor(Math.random() * visitorReplies.length)];

            const replyMessage: Message = {
                id: `msg-reply-${Date.now()}`,
                conversationId: selectedId,
                content: randomReply,
                senderType: "VISITOR",
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => ({
                ...prev,
                [selectedId]: [...(prev[selectedId] || []), replyMessage],
            }));
        }, 2500);
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
