import { useState } from "react";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatBubble } from "@/components/chat/chat-bubble";

interface Message {
    id: number;
    text: string;
    isOwn: boolean;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "👋 Welcome! This is a simple chat interface.",
            isOwn: false,
        },
    ]);

    const handleSend = (message: string) => {
        // Add user's message
        const userMessage: Message = {
            id: Date.now(),
            text: message,
            isOwn: true,
        };

        setMessages((prev) => [...prev, userMessage]);

        // Fake agent reply
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: `You said: "${message}"`,
                    isOwn: false,
                },
            ]);
        }, 800);
    };

    return (
        <main className="flex h-screen bg-muted/30">
            <div className="mx-auto flex w-full max-w-5xl flex-col bg-background shadow-sm">
                {/* Header */}
                <header className="border-b px-6 py-4">
                    <h1 className="text-lg font-semibold">
                        Enterprise Live Support
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Connected • Demo Chat
                    </p>
                </header>

                {/* Messages */}
                <section className="flex-1 overflow-y-auto px-6 py-6">
                    {messages.map((message) => (
                        <ChatBubble
                            key={message.id}
                            message={message.text}
                            isOwn={message.isOwn}
                        />
                    ))}
                </section>

                {/* Input */}
                <ChatInput onSend={handleSend} />
            </div>
        </main>
    );
}

export default App;
