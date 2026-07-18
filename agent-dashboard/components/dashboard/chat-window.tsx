"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/lib/store/store";
import { Conversation, Message } from "@/lib/types";
import { mockVisitorDetails } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Send, Smile, CornerDownLeft, Inbox, Bolt, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
    conversation: Conversation | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
    onClaim: () => void;
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
}: ChatWindowProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [inputValue, setInputValue] = useState("");
    const [showCanned, setShowCanned] = useState(false);
    const [filteredCanned, setFilteredCanned] = useState(CANNED_RESPONSES);
    const [cannedIndex, setCannedIndex] = useState(0);
    const feedEndRef = useRef<HTMLDivElement>(null);

    const isClaimedByMe = conversation?.assignedUserId === user?.id;
    const isUnassigned = conversation?.assignedUserId === null;

    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, conversation]);

    // Handle typing change (detect "/")
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.startsWith("/")) {
            setShowCanned(true);
            const query = val.toLowerCase();
            const filtered = CANNED_RESPONSES.filter(
                (c) =>
                    c.shortcut.toLowerCase().includes(query) ||
                    c.text.toLowerCase().includes(query)
            );
            setFilteredCanned(filtered);
            setCannedIndex(0);
        } else {
            setShowCanned(false);
        }
    };

    // Apply Canned Response
    const selectCanned = (text: string) => {
        setInputValue(text);
        setShowCanned(false);
    };

    // Handle Keydown (canned selection list navigation)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showCanned && filteredCanned.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setCannedIndex((prev) => (prev + 1) % filteredCanned.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCannedIndex((prev) => (prev - 1 + filteredCanned.length) % filteredCanned.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                selectCanned(filteredCanned[cannedIndex].text);
            } else if (e.key === "Escape") {
                setShowCanned(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!inputValue.trim() || !isClaimedByMe) return;
        onSendMessage(inputValue.trim());
        setInputValue("");
        setShowCanned(false);
    };

    // Render empty state if no active chat
    if (!conversation) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted/10 p-8 text-center border-r border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 shadow-inner mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No active conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Select a conversation from the sidebar queue, or claim an unassigned ticket to start assisting customers.
                </p>
            </div>
        );
    }

    const visitor = mockVisitorDetails[conversation.visitorId];

    return (
        <section className="flex h-full w-full flex-col bg-background border-r border-border relative">
            {/* Header info */}
            <div className="flex h-16 w-full items-center justify-between border-b border-border bg-card/40 backdrop-blur-md px-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm uppercase">
                        {visitor?.name ? visitor.name.charAt(0) : "V"}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-foreground">
                            {visitor?.name || "Visitor"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-muted-foreground font-medium">
                                Active on checkout
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {conversation.assignedUserId && (
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground font-semibold uppercase">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {isClaimedByMe ? "Assigned to You" : "Assigned"}
                        </div>
                    )}
                </div>
            </div>

            {/* Unassigned banner overlay */}
            {isUnassigned && (
                <div className="flex w-full items-center justify-between bg-amber-500/10 border-b border-amber-500/20 px-6 py-3.5 z-10 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2.5">
                        <Bolt className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-bounce" />
                        <div className="text-left">
                            <p className="text-xs font-bold text-foreground">Unassigned Conversation</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">This conversation is pending agent response.</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onClaim}
                        className="bg-amber-600 text-white hover:bg-amber-500 shadow-md font-semibold text-xs rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Claim Conversation
                    </Button>
                </div>
            )}

            {/* Message bubbles thread */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-12 px-4 text-center">
                        <Sparkles className="h-8 w-8 text-primary/40 animate-pulse mb-3" />
                        <p className="text-sm font-semibold text-muted-foreground">New Connection</p>
                        <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">
                            No message history. Claim the conversation and type below to begin.
                        </p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isAgent = m.senderType === "AGENT";
                        return (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex w-full flex-col gap-1.5",
                                    isAgent ? "items-end" : "items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                        isAgent
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted text-foreground rounded-tl-none"
                                    )}
                                >
                                    <p className="leading-relaxed break-words">{m.content}</p>
                                </div>
                                <span suppressHydrationWarning className="text-[9px] text-muted-foreground px-1.5 font-medium">
                                    {new Date(m.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={feedEndRef} />
            </div>

            {/* Compose area */}
            <div className="border-t border-border bg-card/30 backdrop-blur-md p-4">
                {/* Canned Responses Suggestion Dropdown */}
                {showCanned && filteredCanned.length > 0 && (
                    <div className="absolute left-4 right-4 bottom-20 z-50 rounded-xl border border-border bg-popover p-2 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border mb-1 text-[10px] font-bold text-muted-foreground uppercase">
                            <Terminal className="h-3 w-3" />
                            Canned response shortcuts
                        </div>
                        <ul className="space-y-0.5">
                            {filteredCanned.map((c, i) => (
                                <li
                                    key={c.shortcut}
                                    onClick={() => selectCanned(c.text)}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs",
                                        i === cannedIndex
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    <span className="font-semibold">{c.shortcut}</span>
                                    <span className={cn("truncate max-w-[240px]", i === cannedIndex ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                        {c.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                        <input
                            type="text"
                            placeholder={
                                isClaimedByMe
                                    ? "Type a message... (use '/' for shortcuts)"
                                    : "You must claim this chat to write messages"
                            }
                            disabled={!isClaimedByMe}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="h-11 w-full rounded-xl border border-input bg-background/50 pl-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            disabled={!isClaimedByMe}
                            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                        >
                            <Smile className="h-5 w-5" />
                        </button>
                    </div>

                    <Button
                        size="icon"
                        disabled={!isClaimedByMe || !inputValue.trim()}
                        onClick={handleSend}
                        className="h-11 w-11 rounded-xl bg-primary text-primary-foreground shadow-md hover:bg-primary/95 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Send className="h-4.5 w-4.5" />
                    </Button>
                </div>

                <div className="flex items-center justify-between mt-2.5 px-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CornerDownLeft className="h-3 w-3" />
                        Press Enter to send
                    </span>
                </div>
            </div>
        </section>
    );
}
