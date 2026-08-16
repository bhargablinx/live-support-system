"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/lib/store/store";
import { ConversationList } from "@/components/dashboard/conversation-list";
import { ChatWindow } from "@/components/dashboard/chat-window";
import { CustomerDetails } from "@/components/dashboard/customer-details";
import { Conversation, Message, InternalNote } from "@/lib/types";
import { useDashboardSocket } from "@/hooks/use-dashboard-socket";
import {
    fetchConversations,
    fetchMessages,
    claimConversation,
    resolveConversation,
    archiveConversation,
    reopenConversation,
    deleteConversation,
} from "@/lib/api/conversation";
import {
    fetchInternalNotes,
    createInternalNote,
    deleteInternalNote,
} from "@/lib/api/note";

export default function DashboardPage() {
    const { user } = useAppSelector((state) => state.auth);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [notes, setNotes] = useState<Record<string, InternalNote[]>>({});
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
    const activeNotes = selectedId ? notes[selectedId] || [] : [];

    // Load initial data — wrapped in useCallback so the reference is stable.
    const loadConversations = useCallback(async () => {
        try {
            const res = await fetchConversations();
            if (res.statusCode === 200 && res.data) {
                const list = Array.isArray(res.data) ? res.data : res.data.conversations || [];
                setConversations(list);

                // Populate messages state map with preview messages
                const msgMap: Record<string, Message[]> = {};
                list.forEach((c) => {
                    msgMap[c.id] = c.messages || [];
                });
                setMessages((prev) => ({ ...msgMap, ...prev }));
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        }
    }, []);

    // Fetch initial conversations on mount
    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadConversations();
        }
    }, [user, loadConversations]);

    // Fetch full messages and internal notes history when a conversation is selected
    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId)
                .then((res) => {
                    if (res.statusCode === 200 && res.data) {
                        setMessages((prev) => ({
                            ...prev,
                            [selectedId]: res.data,
                        }));
                    }
                })
                .catch((err) => console.error("Failed to load conversation messages:", err));

            fetchInternalNotes(selectedId)
                .then((res) => {
                    if (res.statusCode === 200 && res.data) {
                        setNotes((prev) => ({
                            ...prev,
                            [selectedId]: res.data,
                        }));
                    }
                })
                .catch((err) => console.error("Failed to load conversation internal notes:", err));
        }
    }, [selectedId]);

    const handleNoteCreated = useCallback(({ conversationId, note }: { conversationId: string; note: InternalNote }) => {
        setNotes((prev) => {
            const list = prev[conversationId] || [];
            if (list.some((n) => n.id === note.id)) return prev;
            return {
                ...prev,
                [conversationId]: [...list, note],
            };
        });
    }, []);

    const handleNoteDeleted = useCallback(({ conversationId, noteId }: { conversationId: string; noteId: string }) => {
        setNotes((prev) => {
            const list = prev[conversationId] || [];
            return {
                ...prev,
                [conversationId]: list.filter((n) => n.id !== noteId),
            };
        });
    }, []);

    // Setup Socket.io real-time connection and event listeners
    const { sendMessage, sendTypingEvent } = useDashboardSocket({
        conversationsRef,
        setConversations,
        setMessages,
        setOnlineVisitors,
        setVisitorTyping: setVisitorTypingConvoId,
        loadConversations,
        selectedId,
        onInternalNoteCreated: handleNoteCreated,
        onInternalNoteDeleted: handleNoteDeleted,
    });

    const handleSendNote = async (content: string) => {
        if (!selectedId) return;
        try {
            const res = await createInternalNote(selectedId, content);
            if (res.statusCode === 201 && res.data) {
                handleNoteCreated({ conversationId: selectedId, note: res.data });
            }
        } catch (error) {
            console.error("Failed to create internal note:", error);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!selectedId) return;
        try {
            const res = await deleteInternalNote(selectedId, noteId);
            if (res.statusCode === 200) {
                handleNoteDeleted({ conversationId: selectedId, noteId });
            }
        } catch (error) {
            console.error("Failed to delete internal note:", error);
        }
    };

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
                    notes={activeNotes}
                    onSendMessage={sendMessage}
                    onSendNote={handleSendNote}
                    onDeleteNote={handleDeleteNote}
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
