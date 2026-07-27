import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { SendHorizontal, Paperclip, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/api";

interface ChatInputProps {
    onSend: (message: string, attachments?: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>) => void;
    onTypingChange?: (isTyping: boolean) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ChatInput({ onSend, onTypingChange, isLoading = false, disabled = false }: ChatInputProps) {
    const { visitorToken } = useSelector((state: RootState) => state.auth);
    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !visitorToken) return;

        setIsUploading(true);
        try {
            const res = await uploadFile(file, visitorToken);
            if (res) {
                // Send file attachment immediately
                onSend("", [res]);
            } else {
                alert("Failed to upload attachment");
            }
        } catch (error) {
            console.error("Failed to upload file:", error);
            alert("Error uploading file. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="border-t bg-muted/20 px-6 py-5">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-end gap-2 rounded-3xl border bg-background p-2 shadow-lg shadow-black/5 transition-all focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={disabled || isUploading}
                    />

                    {/* Attachment */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || isUploading}
                        className="h-11 w-11 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Paperclip className="h-5 w-5" />
                        )}
                    </Button>

                    {/* Textarea */}
                    <Textarea
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        rows={1}
                        placeholder={
                            disabled
                                ? "This conversation has been resolved."
                                : "Message..."
                        }
                        className="min-h-[46px] max-h-40 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
                    />

                    {/* Send */}
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!message.trim() || isLoading || disabled}
                        className="h-11 w-11 shrink-0 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <SendHorizontal className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                    Press{" "}
                    <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                        Enter
                    </kbd>{" "}
                    to send •{" "}
                    <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                        Shift + Enter
                    </kbd>{" "}
                    for a new line
                </p>
            </div>
        </div>
    );
}
