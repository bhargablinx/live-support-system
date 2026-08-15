"use client";

import React, { useState, useMemo } from "react";
import { Conversation, Tag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Laptop, Clock, StickyNote, CheckCircle, RefreshCcw, Archive, Star, UserCheck, Tag as TagIcon, Plus, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { fetchTags, addTagToConversation, removeTagFromConversation } from "@/lib/api/tag";

interface VisitorDetail {
    id: string;
    organizationId: string;
    token: string;
    createdAt: string;
    name: string;
    email: string;
    location: string;
    currentUrl: string;
    browser: string;
    os: string;
    notes?: string;
}

interface CustomerDetailsProps {
    conversation: Conversation | null;
    onResolve: () => void;
    onArchive: () => void;
    onReopen: () => void;
    isOnline?: boolean;
}

export function CustomerDetails({ conversation, onResolve, onArchive, onReopen, isOnline = false }: CustomerDetailsProps) {
    // Load visitor detail
    const dbVisitor = conversation?.visitor;

    const visitor: VisitorDetail | undefined = useMemo(() => {
        if (!dbVisitor) return undefined;
        return {
            id: dbVisitor.id,
            organizationId: dbVisitor.organizationId,
            token: dbVisitor.token,
            createdAt: dbVisitor.createdAt,
            name: dbVisitor.name || `Visitor #${dbVisitor.id.slice(-4)}`,
            email: dbVisitor.email || "Not provided",
            location: dbVisitor.location || "Unknown Location",
            currentUrl: dbVisitor.currentUrl || "Unknown Page",
            browser: dbVisitor.browser || "Unknown Browser",
            os: dbVisitor.os || "Unknown OS",
            notes: ""
        };
    }, [dbVisitor]);

    const [notes, setNotes] = useState(() => visitor?.notes || "");
    const [savedNotes, setSavedNotes] = useState(() => visitor?.notes || "");
    const [prevVisitorId, setPrevVisitorId] = useState<string | null>(() => visitor?.id || null);

    const [orgTags, setOrgTags] = useState<Tag[]>([]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    const loadOrgTags = async () => {
        try {
            const res = await fetchTags();
            if (res.data) setOrgTags(res.data);
        } catch {
            // Silently handle error
        }
    };

    const handleAddTag = async (tagId?: string, name?: string) => {
        if (!conversation) return;
        try {
            await addTagToConversation(conversation.id, { tagId, name });
            setNewTagName("");
            setIsAddingTag(false);
            loadOrgTags();
        } catch (err) {
            console.error("Failed to add tag", err);
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        if (!conversation) return;
        try {
            await removeTagFromConversation(conversation.id, tagId);
        } catch (err) {
            console.error("Failed to remove tag", err);
        }
    };

    // Adjust state during render when visitor changes (avoiding useEffect cascading renders)
    if ((visitor?.id || null) !== prevVisitorId) {
        setPrevVisitorId(visitor?.id || null);
        setNotes(visitor?.notes || "");
        setSavedNotes(visitor?.notes || "");
    }

    const handleSaveNotes = () => {
        if (!visitor) return;
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
                        variant={isOnline ? "secondary" : "outline"}
                        className={`mt-3 ${isOnline ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : ""}`}
                    >
                        {isOnline ? "Online" : "Offline"}
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

                        {conversation.assignedUser && (
                            <div className="flex items-start gap-2.5 text-xs">
                                <UserCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">Assigned Agent</p>
                                    <p className="text-muted-foreground mt-0.5 font-medium">
                                        {conversation.assignedUser.name || conversation.assignedUser.email}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation Tags */}
                <div className="space-y-3 border-t border-border/60 pt-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <TagIcon className="h-3.5 w-3.5" />
                            Tags
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setIsAddingTag(!isAddingTag);
                                if (!isAddingTag) loadOrgTags();
                            }}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Tag
                        </Button>
                    </div>

                    {/* Current Tags List */}
                    <div className="flex flex-wrap gap-1.5">
                        {(conversation.tags && conversation.tags.length > 0) ? (
                            conversation.tags.map((ct) => (
                                <span
                                    key={ct.tagId}
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white shadow-xs"
                                    style={{ backgroundColor: ct.tag.color || "#6366f1" }}
                                >
                                    {ct.tag.name}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(ct.tagId)}
                                        className="hover:opacity-75 focus:outline-none ml-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground italic">No tags assigned</p>
                        )}
                    </div>

                    {/* Add Tag Popover/Input */}
                    {isAddingTag && (
                        <div className="mt-2 space-y-2 rounded-xl border border-border bg-background/60 p-2.5 text-xs">
                            {orgTags.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold text-muted-foreground">Select existing tag:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {orgTags
                                            .filter((t) => !conversation.tags?.some((ct) => ct.tagId === t.id))
                                            .map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => handleAddTag(t.id)}
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white transition-opacity hover:opacity-80"
                                                    style={{ backgroundColor: t.color || "#6366f1" }}
                                                >
                                                    {t.name}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-1.5 pt-1">
                                <input
                                    type="text"
                                    placeholder="Or type new tag..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && newTagName.trim()) {
                                            e.preventDefault();
                                            handleAddTag(undefined, newTagName.trim());
                                        }
                                    }}
                                    className="flex-1 rounded-lg border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <Button
                                    size="sm"
                                    className="h-7 text-[11px] px-2.5"
                                    disabled={!newTagName.trim()}
                                    onClick={() => handleAddTag(undefined, newTagName.trim())}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Customer Feedback */}
                {conversation.feedback && (
                    <div className="space-y-3 border-t border-border/60 pt-4">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            Customer Feedback
                        </h4>
                        <Card className="bg-muted/40 border border-border shadow-none rounded-xl">
                            <CardContent className="p-3.5 space-y-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= conversation.feedback!.rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-muted-foreground/20"
                                                }`}
                                        />
                                    ))}
                                    <span className="text-xs font-semibold ml-1.5 text-foreground">
                                        {conversation.feedback.rating}/5
                                    </span>
                                </div>
                                {conversation.feedback.comment && (
                                    <p className="text-xs text-foreground italic leading-relaxed bg-background/50 p-2 rounded-lg border border-border/50">
                                        &quot;{conversation.feedback.comment}&quot;
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Submitted on {new Date(conversation.feedback.createdAt).toLocaleDateString([], {
                                        dateStyle: "medium"
                                    })}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

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
