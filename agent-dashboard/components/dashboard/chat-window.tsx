"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/lib/store/store";
import { Conversation, Message } from "@/lib/types";
import { mockVisitorDetails } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Command, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Send, Smile, Paperclip, MoreHorizontal, Inbox, UserPlus, Bolt, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
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
    onSendMessage,
    onClaim,
    onDelete,
    isOnline = false,
    isVisitorTyping = false,
    onTypingChange,
}: ChatWindowProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [inputValue, setInputValue] = useState("");
    const [showCanned, setShowCanned] = useState(false);
    const [filteredCanned, setFilteredCanned] = useState(CANNED_RESPONSES);
    const feedEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // Track whether we've emitted type_start so we don't spam
    const isTypingRef = useRef(false);
    const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isClaimedByMe = conversation?.assignedUserId === user?.id;
    const isUnassigned = conversation?.assignedUserId === null;

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

    const handleSend = () => {
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
        onSendMessage(inputValue.trim());
        setInputValue("");
        setShowCanned(false);
    };

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
    const mockVisitor = mockVisitorDetails[conversation.visitorId];
    const visitorName = mockVisitor?.name || dbVisitor?.name || `Visitor #${conversation.visitorId.slice(-4)}`;
    const visitorEmail = mockVisitor?.email || dbVisitor?.email || "visitor@example.com";
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

                <div className="flex items-center gap-4">
                    {conversation.assignedUserId && (
                        <div className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">
                            {isClaimedByMe ? "Assigned to You" : "Assigned"}
                        </div>
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
                    {messages.length === 0 ? (
                        <div className="flex h-[300px] flex-col items-center justify-center text-center">
                            <Avatar className="h-16 w-16 mb-4 border border-border/50">
                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">{avatarChar}</AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold text-foreground">{visitorName}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                No previous conversation
                            </p>
                            <p className="text-sm text-muted-foreground max-w-sm mt-4 bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
                                Start by introducing yourself.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center my-2">
                                <Separator className="flex-1" />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground px-4 bg-transparent">Today</span>
                                <Separator className="flex-1" />
                            </div>

                            {groupedMessages.map((m, index) => {
                                const isAgent = m.senderType === "AGENT";
                                const prevMessage = index > 0 ? groupedMessages[index - 1] : null;
                                const showSender = !prevMessage || prevMessage.senderType !== m.senderType;

                                return (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "flex w-full flex-col gap-1",
                                            isAgent ? "items-end" : "items-start"
                                        )}
                                    >
                                        {showSender && (
                                            <span className="text-xs font-semibold text-muted-foreground mb-0.5 px-1">
                                                {isAgent ? "You" : visitorName.split(" ")[0]}
                                            </span>
                                        )}
                                        <div
                                            className={cn(
                                                "relative max-w-[75%] px-3.5 pt-2.5 pb-2 text-[14px] shadow-sm flex flex-col gap-1 rounded-2xl",
                                                isAgent
                                                    ? "bg-primary text-primary-foreground rounded-br-[4px]"
                                                    : "bg-background border border-border text-foreground rounded-bl-[4px]"
                                            )}
                                        >
                                            <p className="leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
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
                <div className="relative rounded-xl border border-input bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">

                    {/* Canned Responses Popover inside Input container visually */}
                    {showCanned && filteredCanned.length > 0 && (
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
                            isClaimedByMe
                                ? "🙂 Type a message... (use '/' for shortcuts)"
                                : "You must claim this chat to write messages"
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
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={!isClaimedByMe}>
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={!isClaimedByMe}>
                                <Smile className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            size="sm"
                            disabled={!isClaimedByMe || !inputValue.trim()}
                            onClick={handleSend}
                            variant={inputValue.trim() ? "default" : "ghost"}
                            className={cn(
                                "h-8 px-3 rounded-lg transition-all",
                                !inputValue.trim() && "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Send className="h-4 w-4 mr-1.5" />
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
