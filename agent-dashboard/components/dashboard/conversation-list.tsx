"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/store/store";
import { Conversation, Message } from "@/lib/types";
import { Search, Inbox, UserCheck, CheckCircle2, RefreshCw, MessageSquareOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "../ui/scroll-area";

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

        const visitorName = c.visitor?.name?.toLowerCase() || (c.visitor ? `visitor #${c.visitorId.slice(-4)}` : "visitor");
        const visitorEmail = c.visitor?.email?.toLowerCase() || "not provided";
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
            <div className="border-b px-5 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">
                            Inbox
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {filteredConversations.length} active conversations
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Search Input */}
            <div className="px-4 py-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="h-10 rounded-xl pl-10"
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            {/* <div className="grid grid-cols-3 gap-1 px-4 mb-4">
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
            </div> */}

            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as TabType)}
                className="px-4 pb-4"
            >
                <TabsList className="grid w-full grid-cols-3 h-10 rounded-xl bg-muted/60 p-1">
                    <TabsTrigger
                        value="mine"
                        className="flex items-center justify-center gap-1.5 px-2 text-xs rounded-lg"
                    >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Mine</span>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0 px-1.5 py-0 text-[10px]">
                            {getTabCount("mine")}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger
                        value="unassigned"
                        className="flex items-center justify-center gap-1.5 px-2 text-xs rounded-lg"
                    >
                        <Inbox className="h-3.5 w-3.5" />
                        <span>Open</span>
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-0 px-1.5 py-0 text-[10px]">
                            {getTabCount("unassigned")}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger
                        value="resolved"
                        className="flex items-center justify-center gap-1.5 px-2 text-xs rounded-lg"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Closed</span>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0 px-1.5 py-0 text-[10px]">
                            {getTabCount("resolved")}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Chat List Scrollarea */}

            <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                    {filteredConversations.length === 0 ? (
                        <div className="flex h-[320px] flex-col items-center justify-center px-6 text-center">
                            <div className="mb-4 rounded-full bg-muted p-4">
                                <MessageSquareOff className="h-6 w-6 text-muted-foreground" />
                            </div>

                            <h3 className="text-sm font-semibold">
                                No conversations
                            </h3>

                            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                                {searchQuery
                                    ? "No conversations match your search."
                                    : "You're all caught up. New conversations will appear here."}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((c) => {
                            const chatMessages = messages[c.id] || [];
                            const lastMessage = chatMessages.at(-1);

                            const isSelected = selectedId === c.id;

                            const visitorName =
                                c.visitor?.name ||
                                (c.visitor
                                    ? `Visitor #${c.visitorId.slice(-4)}`
                                    : "Visitor");

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
                                        "group relative flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                                        isSelected
                                            ? "border-primary/30 bg-accent"
                                            : "border-transparent hover:border-border hover:bg-accent/60"
                                    )}
                                >
                                    {isSelected && (
                                        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary" />
                                    )}

                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                            {visitorName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="truncate text-sm font-semibold">
                                                {visitorName}
                                            </h3>

                                            <span
                                                suppressHydrationWarning
                                                className="text-xs text-muted-foreground"
                                            >
                                                {timeStr}
                                            </span>
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {lastMessage?.content || "No messages yet"}
                                        </p>

                                        <div className="mt-3 flex items-center gap-2">
                                            {c.status === "NEW" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="border-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                >
                                                    New
                                                </Badge>
                                            )}

                                            {c.status === "ACTIVE" && (
                                                <Badge variant="outline">
                                                    Active
                                                </Badge>
                                            )}

                                            {c.status === "RESOLVED" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="border-0 bg-muted"
                                                >
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </section>
    );
}
