import { X } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import type { Message, SocketStatus } from "../../types/type";
import { useState } from "react";
import { createVisitor } from "@/lib/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { saveToLocal } from "@/lib/utils";
import { setVisitorToken } from "@/features/auth/authSlice";

interface ChatPageProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    messages: Message[];
    onSend: (message: string) => void;
    socketStatus: SocketStatus;
    isResolved?: boolean;
    isAgentTyping?: boolean;
    onTypingChange?: (isTyping: boolean) => void;
}

const statusConfig: Record<SocketStatus, { label: string; color: string; pulse: boolean }> = {
    connecting: { label: "Connecting...", color: "bg-yellow-400", pulse: true },
    connected: { label: "Connected", color: "bg-green-400", pulse: false },
    disconnected: { label: "Disconnected", color: "bg-red-500", pulse: false },
};

export default function ChatPage({ open, setOpen, messages, onSend, socketStatus, isResolved = false, isAgentTyping = false, onTypingChange }: ChatPageProps) {
    const { organizationId, visitorToken } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSend = (message: string) => {
        onSend(message);
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

                {/* Onboarding Form */}
                <form onSubmit={handleRegisterVisitor} className="flex-1 flex flex-col justify-center p-6 space-y-4">
                    <div className="space-y-2 text-center">
                        <h3 className="text-lg font-bold text-foreground">Welcome!</h3>
                        <p className="text-xs text-muted-foreground">Please enter your name to start a live support session with our agents.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="name-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Name</label>
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

                    <div className="space-y-1.5">
                        <label htmlFor="email-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Email</label>
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
                    <h2 className="font-semibold">Support</h2>
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
                        />
                    );
                })}
            </div>

            {/* Typing indicator */}
            {isAgentTyping && (
                <div className="px-4 pb-1 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-[4px] bg-background border border-border px-3 py-2 text-xs text-muted-foreground shadow-sm w-fit">
                        <span className="font-medium">Agent is typing</span>
                        <span className="flex gap-0.5 items-end h-3">
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                        </span>
                    </div>
                </div>
            )}

            {/* Input */}
            <ChatInput onSend={handleSend} disabled={isResolved} onTypingChange={onTypingChange} />
        </div>
    );
}
