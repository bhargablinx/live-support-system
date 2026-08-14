import { X, Plus, Star, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import type { Message, SocketStatus } from "../../types/type";
import { useState, useRef, useEffect } from "react";
import { createVisitor, submitFeedback } from "@/lib/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { saveToLocal } from "@/lib/utils";
import { setVisitorToken } from "@/features/auth/authSlice";

interface ChatPageProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    messages: Message[];
    onSend: (message: string, attachments?: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>) => void;
    socketStatus: SocketStatus;
    isResolved?: boolean;
    conversationId: string | null;
    feedbackSubmitted?: boolean;
    onFeedbackSubmitted?: () => void;
    isAgentTyping?: boolean;
    onTypingChange?: (isTyping: boolean) => void;
    historyLoading?: boolean;
    onCreateNewIssue?: () => void;
    assignedAgentName?: string | null;
}

const statusConfig: Record<SocketStatus, { label: string; color: string; pulse: boolean }> = {
    connecting: { label: "Connecting...", color: "bg-yellow-400", pulse: true },
    connected: { label: "Connected", color: "bg-green-400", pulse: false },
    disconnected: { label: "Disconnected", color: "bg-red-500", pulse: false },
};

export default function ChatPage({ open, setOpen, messages, onSend, socketStatus, isResolved = false, conversationId, feedbackSubmitted = false, onFeedbackSubmitted, isAgentTyping = false, onTypingChange, historyLoading = false, onCreateNewIssue, assignedAgentName }: ChatPageProps) {
    const { organizationId, visitorToken } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const handleSend = (message: string, attachments?: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>) => {
        onSend(message, attachments);
    };

    const handleRegisterVisitor = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        if (!trimmedName || !trimmedEmail || !organizationId) return;

        setIsSubmitting(true);
        createVisitor(organizationId, trimmedName, trimmedEmail)
            .then((res) => {
                if (res && res.visitorToken) {
                    saveToLocal("visitorToken", res.visitorToken);
                    dispatch(setVisitorToken(res.visitorToken));
                }
                setIsSubmitting(false);
            })
            .catch((error) => {
                console.log("Error while creating visitor", error.message);
                setIsSubmitting(false);
            });
    };

    if (!open) return null;

    if (!visitorToken) {
        return (
            <div className="fixed bottom-24 right-6 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
                    <div>
                        <h2 className="font-semibold">Support Onboarding</h2>
                        <p className="text-[10px] opacity-80">Tell us who you are to start</p>
                    </div>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Body */}
                <form onSubmit={handleRegisterVisitor} className="flex-1 p-6 space-y-4 flex flex-col justify-center">
                    <div className="space-y-1 text-center mb-2">
                        <h3 className="text-lg font-bold">Welcome! 👋</h3>
                        <p className="text-xs text-muted-foreground">Please enter your name and email to start chatting with our support team.</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="name-input" className="text-xs font-semibold text-foreground">Your Name</label>
                        <input
                            id="name-input"
                            type="text"
                            placeholder="e.g. John Doe"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 w-full rounded-lg border border-input bg-background/50 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email-input" className="text-xs font-semibold text-foreground">Email Address</label>
                        <input
                            id="email-input"
                            type="email"
                            placeholder="e.g. john@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 w-full rounded-lg border border-input bg-background/50 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting || !name.trim() || !email.trim()} className="w-full font-semibold h-10 rounded-lg">
                        {isSubmitting ? "Starting Chat..." : "Start Chat"}
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
                <div>
                    <h2 className="font-semibold">
                        {assignedAgentName ? `Support (${assignedAgentName})` : "Support"}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${statusConfig[socketStatus].color} ${statusConfig[socketStatus].pulse ? "animate-pulse" : ""}`}
                        />
                        <p className="text-xs opacity-80">{statusConfig[socketStatus].label}</p>
                    </div>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setOpen(false)}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {historyLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span className="text-xs">Loading messages...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            if (message.senderType === "SYSTEM") {
                                return (
                                    <div key={message.id} className="mb-4 flex justify-center animate-in fade-in duration-300">
                                        <div className="rounded-full bg-muted/80 px-3 py-1 text-[11px] font-medium text-muted-foreground border shadow-sm">
                                            {message.content}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <ChatBubble
                                    key={message.id}
                                    message={message.content}
                                    isOwn={message.senderType === "VISITOR"}
                                    attachments={message.attachments}
                                />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Typing indicator */}
            {isAgentTyping && (
                <div className="px-4 pb-1 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-[4px] bg-background border border-border px-3 py-2 text-xs text-muted-foreground shadow-sm w-fit">
                        <span className="font-medium">{assignedAgentName ? `${assignedAgentName} is typing` : "Agent is typing"}</span>
                        <span className="flex gap-0.5 items-end h-3">
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                        </span>
                    </div>
                </div>
            )}

            {/* Footer */}
            {(() => {
                if (!isResolved) {
                    return <ChatInput onSend={handleSend} disabled={false} onTypingChange={onTypingChange} />;
                }

                if (!feedbackSubmitted && conversationId) {
                    return (
                        <FeedbackForm
                            conversationId={conversationId}
                            visitorToken={visitorToken || ""}
                            onSubmitSuccess={onFeedbackSubmitted || (() => { })}
                        />
                    );
                }

                return (
                    <div className="border-t bg-background p-5 flex flex-col items-center justify-center gap-3 animate-in slide-in-from-bottom duration-300">
                        <div className="flex flex-col items-center gap-1.5 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 animate-bounce" />
                            <p className="text-sm font-semibold text-foreground">Thank you for your feedback!</p>
                            <p className="text-xs text-muted-foreground">Your response helps us improve our service.</p>
                        </div>
                        <Button
                            onClick={onCreateNewIssue}
                            className="w-full max-w-[280px] font-semibold py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Issue
                        </Button>
                    </div>
                );
            })()}
        </div>
    );
}

interface FeedbackFormProps {
    conversationId: string;
    visitorToken: string;
    onSubmitSuccess: () => void;
}

function FeedbackForm({ conversationId, visitorToken, onSubmitSuccess }: FeedbackFormProps) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await submitFeedback(conversationId, visitorToken, rating, comment);
            if (res) {
                onSubmitSuccess();
            } else {
                setError("Failed to submit feedback. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t bg-background p-4 flex flex-col gap-3 animate-in slide-in-from-bottom duration-300">
            <div className="text-center">
                <p className="text-sm font-semibold text-foreground">How was your support experience?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Please rate your conversation</p>
            </div>

            <div className="flex justify-center gap-1.5 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                        <Star
                            className={`h-7 w-7 transition-colors duration-150 ${star <= (hoverRating ?? rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground/30"
                                }`}
                        />
                    </button>
                ))}
            </div>

            <textarea
                placeholder="Leave an optional comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[60px] max-h-[120px] rounded-lg border border-input bg-background/50 p-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed"
            />

            {error && <p className="text-[10px] text-destructive text-center font-medium">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full font-semibold h-9 rounded-lg">
                {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
        </form>
    );
}
