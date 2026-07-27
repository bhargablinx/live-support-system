import type { Attachment } from "../../types/type";
import { Paperclip } from "lucide-react";

interface ChatBubbleProps {
    message: string;
    isOwn?: boolean;
    attachments?: Attachment[];
}

export function ChatBubble({ message, isOwn = false, attachments }: ChatBubbleProps) {
    return (
        <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm flex flex-col gap-1.5 shadow-sm ${
                    isOwn
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border bg-muted"
                }`}
            >
                {message && <div className="leading-relaxed break-words whitespace-pre-wrap">{message}</div>}

                {attachments && attachments.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                        {attachments.map((att) => {
                            const isImg = att.fileType.startsWith("image/");
                            return (
                                <div key={att.id} className="max-w-[240px] rounded-lg overflow-hidden border border-border/50 bg-black/5 dark:bg-white/5">
                                    {isImg ? (
                                        <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={att.fileUrl} alt={att.fileName} className="max-h-[160px] object-cover hover:opacity-90 transition-opacity w-full" />
                                        </a>
                                    ) : (
                                        <a
                                            href={att.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs font-medium text-inherit"
                                        >
                                            <Paperclip className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate max-w-[120px]">{att.fileName}</span>
                                            <span className="text-[9px] opacity-60">({Math.round(att.fileSize / 1024)} KB)</span>
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
