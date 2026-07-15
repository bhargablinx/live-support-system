interface ChatBubbleProps {
    message: string;
    isOwn?: boolean;
}

export function ChatBubble({ message, isOwn = false }: ChatBubbleProps) {
    return (
        <div className={`mb-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    isOwn
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border bg-muted"
                }`}
            >
                {message}
            </div>
        </div>
    );
}
