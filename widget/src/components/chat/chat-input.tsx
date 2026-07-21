import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
    onSend: (message: string) => void;
    onTypingChange?: (isTyping: boolean) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ChatInput({ onSend, onTypingChange, isLoading = false, disabled = false }: ChatInputProps) {
    const [message, setMessage] = useState("");
    // Track whether we've already emitted type_start so we don't spam
    const isTypingRef = useRef(false);
    // Debounce timer to emit type_stop after 2s of inactivity
    const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
        };
    }, []);

    const emitTypingStart = () => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            onTypingChange?.(true);
        }
    };

    const emitTypingStop = () => {
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTypingChange?.(false);
        }
        if (stopTypingTimer.current) {
            clearTimeout(stopTypingTimer.current);
            stopTypingTimer.current = null;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setMessage(val);

        if (val.trim()) {
            emitTypingStart();
            // Reset the debounce timer each keystroke
            if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
            stopTypingTimer.current = setTimeout(() => {
                emitTypingStop();
            }, 2000);
        } else {
            // Input cleared — stop immediately
            emitTypingStop();
        }
    };

    const handleSend = () => {
        const trimmed = message.trim();
        if (!trimmed || isLoading || disabled) return;

        // Always stop typing before sending
        emitTypingStop();
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
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? "This conversation has been resolved." : "Type your message..."}
                    rows={1}
                    className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0 disabled:opacity-50"
                />

                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading || disabled}
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
