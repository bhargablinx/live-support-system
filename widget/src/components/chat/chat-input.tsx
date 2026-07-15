import { useState } from "react";
import type { KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        const trimmed = message.trim();

        if (!trimmed || isLoading) return;

        onSend(trimmed);
        setMessage("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border bg-background p-3 shadow-sm">
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />

                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    className="h-11 w-11 rounded-full"
                >
                    <SendHorizontal className="h-5 w-5" />
                </Button>
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">
                Press <kbd className="rounded border px-1.5 py-0.5">Enter</kbd>{" "}
                to send,
                <kbd className="ml-1 rounded border px-1.5 py-0.5">
                    Shift + Enter
                </kbd>{" "}
                for a new line.
            </p>
        </div>
    );
}
