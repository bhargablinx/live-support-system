import { X } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import type { Message } from "../../types/type";
import { useEffect, useRef } from "react";
import { createVisitor } from "@/lib/api";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { saveToLocal } from "@/lib/utils";

interface ChatPageProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    messages: Message[];
    onSend: (message: string) => void;
}

export default function ChatPage({ open, setOpen, messages, onSend }: ChatPageProps) {
    const hasOpenedRef = useRef(false);
    const { organizationId } = useSelector((state: RootState) => state.auth)

    const handleSend = (message: string) => {
        onSend(message);
    };

    useEffect(() => {
        if (open && !hasOpenedRef.current) {
            hasOpenedRef.current = true;

            createVisitor(organizationId)
                .then((res) => {
                    console.log("Created visitor!");
                    saveToLocal("visitorToken", res.visitorToken)
                })
                .catch((error) => {
                    console.log("Error while creating visitor", error.message);
                })

        }
    }, [open, organizationId]);

    if (!open) return null;

    return (
        <div className="fixed bottom-24 right-6 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
                <div>
                    <h2 className="font-semibold">Support</h2>
                    <p className="text-xs opacity-80">Typically replies instantly</p>
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
                {messages.map((message) => (
                    <ChatBubble
                        key={message.id}
                        message={message.text}
                        isOwn={message.isOwn}
                    />
                ))}
            </div>

            {/* Input */}
            <ChatInput onSend={handleSend} />
        </div>
    );
}
