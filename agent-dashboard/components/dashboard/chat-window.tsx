"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAppSelector } from "@/lib/store/store";
import { Conversation, Message, InternalNote, Agent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Command, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Send, Smile, Paperclip, MoreHorizontal, Inbox, UserPlus, Bolt, Trash2, Loader2, Lock, StickyNote, MessageSquare, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/api/upload";

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    notes?: InternalNote[];
    agents?: Agent[];
    onSendMessage: (content: string, attachments?: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>) => void;
    onSendNote?: (content: string) => Promise<void>;
    onDeleteNote?: (noteId: string) => Promise<void>;
    onAssignAgent?: (agentId: string) => Promise<void>;
    onClaim?: () => void;
    onDelete?: () => void;
    isOnline?: boolean;
    isVisitorTyping?: boolean;
    onTypingChange?: (isTyping: boolean) => void;
}

const CANNED_RESPONSES = [
    { shortcut: "/hi", text: "Hello! How can I help you today?" },
    { shortcut: "/thanks", text: "Thank you for contacting our support! Have a wonderful day!" },
    { shortcut: "/wait", text: "Please give me a moment while I check this details for you." },
    { shortcut: "/pricing", text: "You can find all our subscription packages at https://acme.com/pricing." },
];

export function ChatWindow({
    conversation,
    messages,
    notes = [],
    agents = [],
    onSendMessage,
    onSendNote,
    onDeleteNote,
    onAssignAgent,
    onClaim,
    onDelete,
    isOnline = false,
    isVisitorTyping = false,
    onTypingChange,
}: ChatWindowProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [inputValue, setInputValue] = useState("");
    const [composeMode, setComposeMode] = useState<"public" | "note">("public");
    const [showCanned, setShowCanned] = useState(false);
    const [filteredCanned, setFilteredCanned] = useState(CANNED_RESPONSES);
    const [isUploading, setIsUploading] = useState(false);
    const feedEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Track whether we've emitted type_start so we don't spam
    const isTypingRef = useRef(false);
    const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isClaimedByMe = conversation?.assignedUserId === user?.id;
    const isUnassigned = conversation?.assignedUserId === null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isClaimedByMe) return;

        setIsUploading(true);
        try {
            const res = await uploadFile(file);
            if (res.statusCode === 200 && res.data) {
                // Send file attachment immediately as a message
                onSendMessage("", [res.data]);
            }
        } catch (error) {
            console.error("Failed to upload file:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, conversation]);

    // Handle typing change (detect "/")
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Typing event logic
        if (val.trim()) {
            if (!isTypingRef.current) {
                isTypingRef.current = true;
                onTypingChange?.(true);
            }
            if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
            stopTypingTimer.current = setTimeout(() => {
                isTypingRef.current = false;
                onTypingChange?.(false);
            }, 2000);
        } else {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                onTypingChange?.(false);
            }
            if (stopTypingTimer.current) {
                clearTimeout(stopTypingTimer.current);
                stopTypingTimer.current = null;
            }
        }

        if (val.startsWith("/")) {
            setShowCanned(true);
            const query = val.toLowerCase().replace("/", "");
            const filtered = CANNED_RESPONSES.filter(
                (c) =>
                    c.shortcut.toLowerCase().includes(query) ||
                    c.text.toLowerCase().includes(query)
            );
            setFilteredCanned(filtered);
        } else {
            setShowCanned(false);
        }
    };

    // Apply Canned Response
    const selectCanned = (text: string) => {
        setInputValue(text);
        setShowCanned(false);
        textareaRef.current?.focus();
    };

    // Handle Keydown
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCanned && filteredCanned.length > 0) {
            if (e.key === "Escape") {
                setShowCanned(false);
            }
            // Simplification: just select the first one if they hit enter while canned is open
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                selectCanned(filteredCanned[0].text);
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey && !showCanned) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !isClaimedByMe) return;
        // Stop typing before sending
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTypingChange?.(false);
        }
        if (stopTypingTimer.current) {
            clearTimeout(stopTypingTimer.current);
            stopTypingTimer.current = null;
        }

        const text = inputValue.trim();
        setInputValue("");
        setShowCanned(false);

        if (composeMode === "note") {
            if (onSendNote) {
                await onSendNote(text);
            }
        } else {
            onSendMessage(text);
        }
    };

    // Timeline items combining messages and internal notes
    const timelineItems = useMemo(() => {
        const msgItems = (messages || []).map((m) => ({ type: "message" as const, data: m, time: new Date(m.createdAt).getTime() }));
        const noteItems = (notes || []).map((n) => ({ type: "note" as const, data: n, time: new Date(n.createdAt).getTime() }));
        return [...msgItems, ...noteItems].sort((a, b) => a.time - b.time);
    }, [messages, notes]);

    // Render empty state if no active chat
    if (!conversation) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/5 p-8 text-center border-r border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20 mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No active conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Select a conversation from the sidebar queue, or claim an unassigned ticket to start assisting customers.
                </p>
            </div>
        );
    }

    const dbVisitor = conversation.visitor;
    const visitorName = dbVisitor?.name || `Visitor #${conversation.visitorId.slice(-4)}`;
    const visitorEmail = dbVisitor?.email || "visitor@example.com";
    const avatarChar = visitorName.charAt(0).toUpperCase();

    const groupedMessages = messages;

    return (
        <section className="flex h-full w-full flex-col bg-background border-r border-border relative overflow-hidden">
            {/* Header info */}
            <div className="flex w-full items-center justify-between border-b border-border bg-card/40 px-6 py-4 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{avatarChar}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <h2 className="text-[15px] font-semibold text-foreground leading-tight">
                            {visitorName}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground leading-none">{visitorEmail}</span>
                            <span className="text-muted-foreground/30 text-[10px] leading-none">•</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`inline-block h-2 w-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                                <span className="text-[11px] text-muted-foreground font-medium leading-none">
                                    {isOnline ? "Online" : "Offline"} • {dbVisitor?.currentUrl || "Unknown Page"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {conversation.assignedUserId && (
                        <div className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">
                            {isClaimedByMe
                                ? "Assigned to You"
                                : `Assigned to ${conversation.assignedUser?.name || conversation.assignedUser?.email || "Agent"}`}
                        </div>
                    )}
                    {(isClaimedByMe || isUnassigned || user?.role === "ADMIN") && onAssignAgent && (
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium border-border shadow-2xs">
                                    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{conversation.assignedUserId ? "Transfer" : "Assign"}</span>
                                </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="text-xs font-semibold">
                                    {conversation.assignedUserId ? "Transfer ticket to..." : "Assign ticket to..."}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {agents.length === 0 ? (
                                    <div className="p-2 text-xs text-muted-foreground text-center">No agents available</div>
                                ) : (
                                    agents.map((ag) => {
                                        const isCurrent = ag.id === conversation.assignedUserId;
                                        return (
                                            <DropdownMenuItem
                                                key={ag.id}
                                                disabled={isCurrent}
                                                onClick={() => onAssignAgent(ag.id)}
                                                className="cursor-pointer flex items-center justify-between text-xs py-2"
                                            >
                                                <span className="font-medium truncate">{ag.name || ag.email}</span>
                                                {isCurrent && (
                                                    <span className="text-[10px] text-muted-foreground font-semibold bg-muted px-1.5 py-0.5 rounded">
                                                        Assigned
                                                    </span>
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 dark:text-red-500 cursor-pointer"
                                    onClick={onDelete}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete Conversation</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Unassigned Conversation Banner */}
            {isUnassigned && (
                <div className="shrink-0 border-b bg-amber-500/5 px-5 py-3">
                    <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-background/80 px-4 py-3 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                                <Bolt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Unassigned conversation
                                </h3>

                                <p className="text-xs text-muted-foreground">
                                    Claim this conversation to start replying to the visitor.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={onClaim}
                            size="sm"
                            className="gap-2 rounded-lg"
                        >
                            <UserPlus className="h-4 w-4" />
                            Claim Conversation
                        </Button>
                    </div>
                </div>
            )}

            {/* Message bubbles thread */}
            <ScrollArea className="flex-1 min-h-0 bg-muted/15">
                <div className="px-6 py-6 flex flex-col gap-6">
                    {timelineItems.length === 0 ? (
                        <div className="flex h-[300px] flex-col items-center justify-center text-center">
                            <Avatar className="h-16 w-16 mb-4 border border-border/50">
                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">{avatarChar}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold text-foreground">{visitorName}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                No previous conversation
                            </p>
                            <p className="text-sm text-muted-foreground max-w-sm mt-4 bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
                                Start by introducing yourself or adding an internal note.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center my-2">
                                <Separator className="flex-1" />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground px-4 bg-transparent">Today</span>
                                <Separator className="flex-1" />
                            </div>

                            {timelineItems.map((item) => {
                                if (item.type === "note") {
                                    const note = item.data;
                                    const canDeleteNote = note.authorId === user?.id || user?.role === "ADMIN";
                                    return (
                                        <div key={`note-${note.id}`} className="w-full flex flex-col items-center my-1">
                                            <div className="w-full max-w-[85%] bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-950 dark:text-amber-100 rounded-xl p-3.5 shadow-xs flex flex-col gap-2">
                                                <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                                                        <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                        <span>INTERNAL NOTE</span>
                                                        <span className="text-amber-600/70 dark:text-amber-400/70 font-normal">
                                                            by {note.author.name || note.author.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-medium text-amber-700/80 dark:text-amber-400/80">
                                                            {new Date(note.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {canDeleteNote && onDeleteNote && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onDeleteNote(note.id)}
                                                                className="text-amber-700/60 hover:text-amber-900 dark:text-amber-400/60 dark:hover:text-amber-200 transition-colors"
                                                                title="Delete internal note"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                const m = item.data;
                                if (m.senderType === "SYSTEM") {
                                    return (
                                        <div key={`sys-${m.id}`} className="w-full flex items-center justify-center my-2">
                                            <span className="text-[11px] font-medium px-3.5 py-1 rounded-full bg-muted/70 text-muted-foreground border border-border/50 shadow-2xs">
                                                {m.content}
                                            </span>
                                        </div>
                                    );
                                }

                                const isAgent = m.senderType === "AGENT";

                                return (
                                    <div
                                        key={`msg-${m.id}`}
                                        className={cn(
                                            "flex w-full flex-col gap-1",
                                            isAgent ? "items-end" : "items-start"
                                        )}
                                    >
                                        <span className="text-xs font-semibold text-muted-foreground mb-0.5 px-1">
                                            {isAgent ? "You" : visitorName.split(" ")[0]}
                                        </span>
                                        <div
                                            className={cn(
                                                "relative max-w-[75%] px-3.5 pt-2.5 pb-2 text-[14px] shadow-sm flex flex-col gap-1 rounded-2xl",
                                                isAgent
                                                    ? "bg-primary text-primary-foreground rounded-br-[4px]"
                                                    : "bg-background border border-border text-foreground rounded-bl-[4px]"
                                            )}
                                        >
                                            {m.content && <p className="leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>}
                                            {m.attachments && m.attachments.length > 0 && (
                                                <div className="flex flex-col gap-2 mt-1">
                                                    {m.attachments.map((att) => {
                                                        const isImg = att.fileType.startsWith("image/");
                                                        return (
                                                            <div key={att.id} className="max-w-[280px] rounded-lg overflow-hidden border border-border/50 bg-black/5 dark:bg-white/5">
                                                                {isImg ? (
                                                                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={att.fileUrl} alt={att.fileName} className="max-h-[200px] object-cover hover:opacity-90 transition-opacity w-full" />
                                                                    </a>
                                                                ) : (
                                                                    <a
                                                                        href={att.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 p-2.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs font-medium text-inherit"
                                                                    >
                                                                        <Paperclip className="h-4 w-4 shrink-0" />
                                                                        <span className="truncate max-w-[150px]">{att.fileName}</span>
                                                                        <span className="text-[10px] opacity-60">({Math.round(att.fileSize / 1024)} KB)</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <span
                                                suppressHydrationWarning
                                                className={cn(
                                                    "text-[10px] self-end mt-0.5 font-medium",
                                                    isAgent ? "text-primary-foreground/70" : "text-muted-foreground"
                                                )}
                                            >
                                                {new Date(m.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                    <div ref={feedEndRef} className="h-2" />

                    {/* Visitor typing indicator */}
                    {isVisitorTyping && (
                        <div className="flex items-start gap-2 mt-2">
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-[4px] bg-background border border-border px-3 py-2 text-xs text-muted-foreground shadow-sm w-fit">
                                <span className="font-medium">Visitor is typing</span>
                                <span className="flex gap-0.5 items-end h-3">
                                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Compose area */}
            <div className="p-4 bg-background border-t border-border shrink-0">
                {/* Mode Selector Toggle Bar */}
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Button
                        type="button"
                        size="sm"
                        variant={composeMode === "public" ? "secondary" : "ghost"}
                        onClick={() => setComposeMode("public")}
                        className={cn(
                            "h-7 text-xs gap-1.5 font-medium rounded-lg",
                            composeMode === "public" && "bg-primary/10 text-primary hover:bg-primary/15"
                        )}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Public Reply
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={composeMode === "note" ? "secondary" : "ghost"}
                        onClick={() => setComposeMode("note")}
                        className={cn(
                            "h-7 text-xs gap-1.5 font-medium rounded-lg",
                            composeMode === "note" && "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold"
                        )}
                    >
                        <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Internal Note
                    </Button>
                </div>

                <div
                    className={cn(
                        "relative rounded-xl border bg-background transition-all shadow-sm",
                        composeMode === "note"
                            ? "border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 focus-within:ring-1 focus-within:ring-amber-500"
                            : "border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
                    )}
                >
                    {/* Canned Responses Popover */}
                    {showCanned && filteredCanned.length > 0 && composeMode === "public" && (
                        <div className="absolute left-0 right-0 bottom-full mb-2 z-50">
                            <Command className="rounded-xl border border-border shadow-lg max-h-[300px]" shouldFilter={false}>
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup heading="Canned Responses">
                                        {filteredCanned.map((c) => (
                                            <CommandItem
                                                key={c.shortcut}
                                                onSelect={() => selectCanned(c.text)}
                                                className="cursor-pointer gap-2"
                                            >
                                                <span className="font-semibold w-16 text-xs">{c.shortcut}</span>
                                                <span className="text-muted-foreground text-xs truncate">{c.text}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                    )}

                    <Textarea
                        ref={textareaRef}
                        placeholder={
                            !isClaimedByMe
                                ? "You must claim this chat to write messages"
                                : composeMode === "note"
                                ? "🔒 Write an internal note (only visible to support agents)..."
                                : "🙂 Type a message... (use '/' for shortcuts)"
                        }
                        disabled={!isClaimedByMe}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className="resize-none border-0 shadow-none focus-visible:ring-0 px-4 py-3 min-h-[44px] max-h-[200px] bg-transparent text-sm"
                    />

                    <div className="flex items-center justify-between px-3 pb-2 pt-1">
                        <div className="flex items-center gap-1">
                            {composeMode === "public" && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={!isClaimedByMe || isUploading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground"
                                        disabled={!isClaimedByMe || isUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={!isClaimedByMe}>
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {composeMode === "note" && (
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 px-1">
                                    <StickyNote className="h-3.5 w-3.5" />
                                    Agent-only annotation
                                </span>
                            )}
                        </div>

                        <Button
                            size="sm"
                            disabled={!isClaimedByMe || !inputValue.trim()}
                            onClick={handleSend}
                            variant={inputValue.trim() ? "default" : "ghost"}
                            className={cn(
                                "h-8 px-3 rounded-lg transition-all gap-1.5",
                                composeMode === "note" && inputValue.trim() && "bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-xs",
                                !inputValue.trim() && "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {composeMode === "note" ? <Lock className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                            {composeMode === "note" ? "Add Note" : "Send"}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
