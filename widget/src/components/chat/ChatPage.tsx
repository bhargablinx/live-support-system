import { X } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import type { Message, SocketStatus } from "../../types/type";
import { useEffect, useRef } from "react";
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
    const hasOpenedRef = useRef(false);
    const { organizationId } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const handleSend = (message: string) => {
        onSend(message);
    };

    useEffect(() => {
        if (open && !hasOpenedRef.current) {
            hasOpenedRef.current = true;

            const existingToken = getFromLocal("visitorToken");
            if (existingToken) {
                dispatch(setVisitorToken(existingToken));
                return;
            }

            if (!organizationId) {
                console.log("No organization ID found");
                return;
            }

            createVisitor(organizationId)
                .then((res) => {
                    console.log("Created visitor!");
                    saveToLocal("visitorToken", res.visitorToken);
                    dispatch(setVisitorToken(res.visitorToken));
                })
                .catch((error) => {
                    console.log("Error while creating visitor", error.message);
                });

        }
    }, [open, organizationId, dispatch]);

    if (!open) return null;

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
