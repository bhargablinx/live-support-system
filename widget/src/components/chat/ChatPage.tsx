import { X } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import type { Message, SocketStatus } from "../../types/type";
import { useEffect, useRef, useState } from "react";
import { createVisitor } from "@/lib/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { saveToLocal, getFromLocal } from "@/lib/utils";
import { setVisitorToken } from "@/features/auth/authSlice";

interface ChatPageProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    messages: Message[];
    onSend: (message: string) => void;
    socketStatus: SocketStatus;
    isResolved?: boolean;
}

const statusConfig: Record<SocketStatus, { label: string; color: string; pulse: boolean }> = {
    connecting: { label: "Connecting...", color: "bg-yellow-400", pulse: true },
    connected: { label: "Connected", color: "bg-green-400", pulse: false },
    disconnected: { label: "Disconnected", color: "bg-red-500", pulse: false },
};

export default function ChatPage({ open, setOpen, messages, onSend, socketStatus, isResolved = false }: ChatPageProps) {
    const { organizationId, visitorToken } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSend = (message: string) => {
        onSend(message);
    };

    const handleRegisterVisitor = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName || !organizationId) return;

        setIsSubmitting(true);
        createVisitor(organizationId, trimmedName)
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

                    <Button type="submit" disabled={isSubmitting || !name.trim()} className="w-full font-semibold h-10 rounded-lg">
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

            {/* Input */}
            <ChatInput onSend={handleSend} disabled={isResolved} />
        </div>
    );
}
