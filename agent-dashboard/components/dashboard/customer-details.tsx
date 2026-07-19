"use client";

import React, { useState, useMemo } from "react";
import { Conversation } from "@/lib/types";
import { mockVisitorDetails, VisitorDetail } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Laptop, Clock, StickyNote, CheckCircle, RefreshCcw, Archive } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface CustomerDetailsProps {
    conversation: Conversation | null;
    onResolve: () => void;
    onArchive: () => void;
    onReopen: () => void;
}

export function CustomerDetails({ conversation, onResolve, onArchive, onReopen }: CustomerDetailsProps) {
    // Load visitor detail
    const dbVisitor = conversation?.visitor;
    const mockVisitor = conversation ? mockVisitorDetails[conversation.visitorId] : undefined;

    const visitor: VisitorDetail | undefined = useMemo(() => {
        return mockVisitor || (dbVisitor ? {
            id: dbVisitor.id,
            organizationId: dbVisitor.organizationId,
            token: dbVisitor.token,
            createdAt: dbVisitor.createdAt,
            name: dbVisitor.name || `Visitor #${dbVisitor.id.slice(-4)}`,
            email: dbVisitor.email || "Not provided",
            location: "Unknown Location",
            currentUrl: "https://acme.com",
            browser: "Web Browser",
            os: "Visitor Device",
            notes: ""
        } : undefined);
    }, [mockVisitor, dbVisitor]);

    const [notes, setNotes] = useState(() => visitor?.notes || "");
    const [savedNotes, setSavedNotes] = useState(() => visitor?.notes || "");
    const [prevVisitorId, setPrevVisitorId] = useState<string | null>(() => visitor?.id || null);

    // Adjust state during render when visitor changes (avoiding useEffect cascading renders)
    if ((visitor?.id || null) !== prevVisitorId) {
        setPrevVisitorId(visitor?.id || null);
        setNotes(visitor?.notes || "");
        setSavedNotes(visitor?.notes || "");
    }

    const handleSaveNotes = () => {
        if (!visitor) return;
        // Update mock state reference directly in the global cache to avoid mutating hook-derived objects
        if (conversation && mockVisitorDetails[conversation.visitorId]) {
            mockVisitorDetails[conversation.visitorId].notes = notes;
        }
        setSavedNotes(notes);
    };

    if (!conversation || !visitor) {
        return (
            <aside className="flex h-full w-80 flex-col items-center justify-center bg-muted/10 p-6 text-center border-l border-border">
                <p className="text-xs text-muted-foreground">Select a conversation to view visitor details.</p>
            </aside>
        );
    }

    const isResolved = conversation.status === "RESOLVED";

    return (
        <aside className="flex h-full w-80 flex-col border-l border-border bg-card/10 overflow-y-auto">
            {/* Header / Avatar */}
            <Card className="rounded-none border-x-0 border-t-0 shadow-none">
                <CardContent className="flex flex-col items-center pt-6">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg font-semibold">
                            {visitor.name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="mt-4 font-semibold">
                        {visitor.name}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        {visitor.email}
                    </p>

                    <Badge
                        variant="secondary"
                        className="mt-3"
                    >
                        Online
                    </Badge>
                </CardContent>
            </Card>

            {/* Profile Info Sections */}
            <div className="flex-1 p-6 space-y-6">
                {/* Location & Details */}
                <div className="space-y-3.5">
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Visitor Context
                    </h4>

                    <div className="space-y-3">
                        <div className="flex items-start gap-2.5 text-xs">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-foreground">Location</p>
                                <p className="text-muted-foreground mt-0.5">{visitor.location}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                            <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-foreground">Active URL</p>
                                <a
                                    href={visitor.currentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline mt-0.5 block truncate max-w-[210px]"
                                >
                                    {visitor.currentUrl}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                            <Laptop className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-foreground">Device / Browser</p>
                                <p className="text-muted-foreground mt-0.5">
                                    {visitor.browser} on {visitor.os}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-foreground">First Seen</p>
                                <p suppressHydrationWarning className="text-muted-foreground mt-0.5">
                                    {new Date(visitor.createdAt).toLocaleString([], {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Editor */}
                <div className="space-y-3 border-t border-border/60 pt-4">
                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <StickyNote className="h-3.5 w-3.5" />
                        Internal Notes
                    </h4>

                    <div className="space-y-2">
                        <textarea
                            placeholder="Add internal notes about this customer..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full min-h-[90px] rounded-lg border border-input bg-background/50 p-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed"
                        />
                        {notes !== savedNotes && (
                            <Button
                                size="sm"
                                onClick={handleSaveNotes}
                                className="w-full text-xs font-semibold h-8 rounded-lg"
                            >
                                Save Notes
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions Area */}
            {isResolved ? (
                <div className="p-4 border-t border-border bg-card/20 space-y-2">
                    <Button
                        variant="default"
                        className="w-full justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs h-10 rounded-lg shadow-sm"
                        onClick={onReopen}
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Reopen Conversation
                    </Button>
                </div>
            ) : (
                <div className="p-4 border-t border-border bg-card/20 space-y-2">
                    <Button
                        variant="default"
                        className="w-full justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-500 font-semibold text-xs h-10 rounded-lg shadow-sm"
                        onClick={onResolve}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Resolve Conversation
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-10 rounded-lg shadow-sm border-transparent"
                        onClick={onArchive}
                    >
                        <Archive className="h-4 w-4" />
                        Archive Conversation
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-center gap-2 font-semibold text-xs h-10 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Transfer Ticket
                    </Button>
                </div>
            )}
        </aside>
    );
}
