"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/store/store";
import { Conversation, Message } from "@/lib/types";
import { mockVisitorDetails } from "@/lib/mock";
import { Search, Inbox, UserCheck, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    messages: Record<string, Message[]>;
}

type TabType = "unassigned" | "mine" | "resolved";

export function ConversationList({
    conversations,
    selectedId,
    onSelect,
    messages,
}: ConversationListProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<TabType>("mine");
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const filteredConversations = conversations.filter((c) => {
        // Tab filter
        const isResolved = c.status === "RESOLVED" || c.status === "ARCHIVED";
        if (activeTab === "resolved") {
            if (!isResolved) return false;
        } else {
            if (isResolved) return false;
            if (activeTab === "mine") {
                if (c.assignedUserId !== user?.id) return false;
            } else if (activeTab === "unassigned") {
                if (c.assignedUserId !== null) return false;
            }
        }

        // Search query filter (search by visitor name/email/ID or message content)
        if (!searchQuery.trim()) return true;

        const visitorDetail = mockVisitorDetails[c.visitorId];
        const visitorName = visitorDetail?.name?.toLowerCase() || (c.visitor ? `visitor #${c.visitorId.slice(-4)}` : "visitor");
        const visitorEmail = visitorDetail?.email?.toLowerCase() || "not provided";
        const query = searchQuery.toLowerCase();

        const matchVisitor = visitorName.includes(query) || visitorEmail.includes(query) || c.visitorId.toLowerCase().includes(query);
        const matchMessages = messages[c.id]?.some((m) => m.content.toLowerCase().includes(query)) || false;

        return matchVisitor || matchMessages;
    });

    const getTabCount = (tab: TabType) => {
        return conversations.filter((c) => {
            const isResolved = c.status === "RESOLVED" || c.status === "ARCHIVED";
            if (tab === "resolved") return isResolved;
            if (isResolved) return false;
            if (tab === "mine") return c.assignedUserId === user?.id;
            if (tab === "unassigned") return c.assignedUserId === null;
            return false;
        }).length;
    };

    return (
        <section className="flex h-full w-full flex-col border-r border-border bg-card/20">
            {/* Header Title */}
            <div className="px-6 pt-6 pb-4">
                <h1 className="text-xl font-bold tracking-tight">Conversations</h1>
            </div>

            {/* Search Input */}
            <div className="px-4 mb-4">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search chats or customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-lg border border-input bg-background/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 gap-1 px-4 mb-4">
                {(["mine", "unassigned", "resolved"] as TabType[]).map((tab) => {
                    const count = getTabCount(tab);
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 rounded-lg py-2.5 px-1.5 text-[11px] font-medium border border-transparent transition-all relative",
                                isActive
                                    ? "bg-background shadow-sm border-border text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                        >
                            {tab === "mine" && <UserCheck className="h-4 w-4" />}
                            {tab === "unassigned" && <Inbox className="h-4 w-4" />}
                            {tab === "resolved" && <CheckCircle2 className="h-4 w-4" />}
                            <span className="capitalize">{tab === "mine" ? "Mine" : tab}</span>
                            {count > 0 && (
                                <span
                                    className={cn(
                                        "absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Chat List Scrollarea */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <p className="text-sm text-muted-foreground font-medium">
                            No conversations found
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            {searchQuery ? "Try checking another query." : "You're all caught up!"}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((c) => {
                        const visitor = mockVisitorDetails[c.visitorId];
                        const chatMessages = messages[c.id] || [];
                        const lastMessage = chatMessages[chatMessages.length - 1];
                        const isSelected = selectedId === c.id;

                        // Calculate relative time
                        const timeStr = lastMessage
                            ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : new Date(c.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              });

                        return (
                            <button
                                key={c.id}
                                onClick={() => onSelect(c.id)}
                                className={cn(
                                    "flex w-full flex-col gap-1.5 rounded-xl p-3.5 text-left border border-transparent transition-all",
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/95"
                                        : "bg-background/40 hover:bg-muted/60 hover:border-border/60"
                                )}
                            >
                                <div className="flex w-full items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs uppercase",
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-primary/10 text-primary"
                                            )}
                                        >
                                            {visitor?.name ? visitor.name.charAt(0) : (c.visitor ? "#" : <User className="h-4 w-4" />)}
                                        </div>
                                        <span className="font-semibold text-sm truncate max-w-[130px]">
                                            {visitor?.name || (c.visitor ? `Visitor #${c.visitorId.slice(-4)}` : "Visitor")}
                                        </span>
                                    </div>
                                    <span
                                        suppressHydrationWarning
                                        className={cn(
                                            "text-[10px]",
                                            isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
                                        )}
                                    >
                                        {timeStr}
                                    </span>
                                </div>

                                <p
                                    className={cn(
                                        "text-xs line-clamp-2",
                                        isSelected ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"
                                    )}
                                >
                                    {lastMessage ? lastMessage.content : "No messages yet."}
                                </p>

                                {!isSelected && c.status === "NEW" && (
                                    <div className="flex w-full items-center justify-end gap-1.5">
                                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                                            New
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </section>
    );
}
